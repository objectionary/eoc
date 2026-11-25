/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import org.eolang.AtVoid;
import org.eolang.PhDefault;
import org.eolang.Phi;

/**
 * The state one inspection session keeps in memory.
 *
 * <p>The session remembers the object it is currently at, and it owns the
 * namespace of the names the user invents: a name like {@code "Φ.bar"}
 * belongs to no object of the program, so the objects the verbs attach
 * under such names have to live here, in the server's own memory.</p>
 *
 * @since 0.0.0
 */
final class Session {

    /**
     * A name the user may invent for an object, as in {@code "Φ.bar"}.
     */
    private static final Pattern INVENTED = Pattern.compile("[A-Za-z0-9_]+");

    /**
     * A piece of data, as in {@code "04-05-96"}.
     */
    private static final Pattern HEX = Pattern.compile("([0-9A-Fa-f]{2})(-[0-9A-Fa-f]{2})*");

    /**
     * The object the session is currently at.
     */
    private final Phi current;

    /**
     * The object the session started at, the root of the tree.
     */
    private final Phi root;

    /**
     * The names invented by the user, pointing at the objects they keep.
     */
    private final Map<String, Phi> invented;

    /**
     * Ctor.
     * @param root The object the session starts at
     */
    Session(final Phi root) {
        this.current = root;
        this.root = root;
        this.invented = new ConcurrentHashMap<>(0);
    }

    /**
     * The forma of the object the session is currently at.
     * @return The forma
     */
    String forma() {
        return this.current.forma();
    }

    /**
     * Make a copy of the object the session is at and attach it under the
     * name the caller chooses, as in {@code cp Φ.bar}.
     *
     * <p>The copy is detached from the origin: attributes registered on
     * the copy afterwards stay invisible to the origin, which is what
     * {@link org.eolang.PhDefault#copy()} arranges. Attributes the origin
     * gains after the copy was made still show up in the copy, since the
     * runtime keeps reading them out of the origin one at a time.</p>
     *
     * @param name The name to attach the copy under, without the
     *  {@code "Φ."} prefix
     * @return JSON answer
     */
    String cp(final String name) {
        final String answer;
        if (Session.INVENTED.matcher(name).matches()) {
            final String full = String.format("Φ.%s", name);
            final Phi copy = this.current.copy();
            this.invented.put(full, copy);
            answer = String.format("{\"copied\":\"%s\"}", Session.json(full));
        } else {
            answer = Session.refuse(name);
        }
        return answer;
    }

    /**
     * Dispatch one attribute of the object the session is at and attach
     * the result under the name the caller chooses, as in
     * {@code dd foo Φ.bar}.
     *
     * <p>The result is whatever the attribute holds, taken as is: a
     * vacant attribute dispatches into a terminator, and an unknown one
     * fails, both answered the way the runtime reports them.</p>
     *
     * @param attr The name of the attribute to dispatch
     * @param name The name to attach the result under, without the
     *  {@code "Φ."} prefix
     * @return JSON answer
     */
    String dd(final String attr, final String name) {
        String answer;
        if (Session.INVENTED.matcher(name).matches()) {
            try {
                final Phi result = this.current.take(attr);
                final String full = String.format("Φ.%s", name);
                this.invented.put(full, result);
                answer = String.format(
                    "{\"dispatched\":\"%s\",\"forma\":\"%s\"}",
                    Session.json(full),
                    Session.json(result.forma())
                );
            } catch (final RuntimeException ex) {
                answer = Session.error(ex.getMessage());
            }
        } else {
            answer = Session.refuse(name);
        }
        return answer;
    }

    /**
     * The object a user-invented name keeps.
     * @param name The full name, as in {@code "Φ.bar"}
     * @return The object, or {@code null} when the name is unknown
     */
    Phi invented(final String name) {
        return this.invented.get(name);
    }

    /**
     * Put a new void attribute on the object the session is at, as in
     * {@code add foo}.
     *
     * <p>The object has to be one the runtime lets write into, which in
     * practice means a {@link PhDefault}. A second add of the same name
     * silently replaces the attribute, since the runtime does not let the
     * session ask which names the object already has.</p>
     *
     * @param name The name of the attribute
     * @return JSON answer
     */
    String add(final String name) {
        String answer;
        if (Session.INVENTED.matcher(name).matches()) {
            try {
                ((PhDefault) this.current).add(name, new AtVoid(name));
                answer = String.format("{\"added\":\"%s\"}", Session.json(name));
            } catch (final ClassCastException ex) {
                answer = Session.error(
                    String.format(
                        "The object of \"%s\" is not one I can add attributes to",
                        this.current.forma()
                    )
                );
            } catch (final RuntimeException ex) {
                answer = Session.error(ex.getMessage());
            }
        } else {
            answer = Session.error(
                String.format(
                    "The name \"%s\" is not one I can add, use letters, digits and underscores",
                    name
                )
            );
        }
        return answer;
    }

    /**
     * Attach an empty formation to the slot the caller names, as in
     * {@code form}.
     *
     * <p>The slot has to be a vacant attribute of the object the session
     * is at, since the runtime lets a void be filled only once.</p>
     *
     * @param slot The name of the vacant attribute to fill
     * @return JSON answer
     */
    String form(final String slot) {
        return this.fill(slot, new PhDefault(), "formed");
    }

    /**
     * Attach data to the slot the caller names, as in
     * {@code put 04-05-96-92-2F-E3}.
     *
     * <p>The slot has to be a vacant attribute, and the bytes are given
     * the way the session in the issue spells them, dash-separated hex
     * pairs.</p>
     *
     * @param slot The name of the vacant attribute to fill
     * @param data The bytes, dash-separated hex pairs
     * @return JSON answer
     */
    String put(final String slot, final String data) {
        final String answer;
        if (!Session.HEX.matcher(data).matches()) {
            answer = Session.error(
                String.format(
                    "The data \"%s\" is not a line of dash-separated hex pairs",
                    data
                )
            );
        } else {
            answer = this.fill(slot, new PhDefault(Session.bytes(data)), "put");
        }
        return answer;
    }

    /**
     * Attach an object known by name to the slot the caller names, as in
     * {@code to Φ.bar}.
     *
     * <p>The name is either {@code "Φ"}, the root the session started at,
     * or one of the names the session invented before, as the ones cp and
     * dd attach under.</p>
     *
     * @param slot The name of the vacant attribute to fill
     * @param name The name of the object to attach
     * @return JSON answer
     */
    String to(final String slot, final String name) {
        final Phi object = this.resolve(name);
        final String answer;
        if (object == null) {
            answer = Session.error(
                String.format("The name \"%s\" belongs to no object I know", name)
            );
        } else {
            answer = this.fill(slot, object, "attached");
        }
        return answer;
    }

    /**
     * Fill a vacant attribute of the object the session is at.
     * @param slot The name of the attribute
     * @param object The object to attach
     * @param verb The verb to confirm in the answer
     * @return JSON answer
     */
    private String fill(final String slot, final Phi object, final String verb) {
        String answer;
        try {
            this.current.put(slot, object);
            answer = String.format(
                "{\"%s\":\"%s\"}",
                verb,
                Session.json(slot)
            );
        } catch (final RuntimeException ex) {
            answer = Session.error(ex.getMessage());
        }
        return answer;
    }

    /**
     * The object a name refers to.
     * @param name The name, as in {@code "Φ"} or {@code "Φ.bar"}
     * @return The object, or {@code null} when unknown
     */
    private Phi resolve(final String name) {
        final Phi found;
        if ("Φ".equals(name)) {
            found = this.root;
        } else {
            found = this.invented.get(name);
        }
        return found;
    }

    /**
     * Turn dash-separated hex pairs into bytes.
     * @param data The text, as in {@code "04-05-96"}
     * @return The bytes
     */
    private static byte[] bytes(final String data) {
        final String[] pairs = data.split("-");
        final byte[] out = new byte[pairs.length];
        for (int idx = 0; idx < pairs.length; ++idx) {
            out[idx] = (byte) Integer.parseInt(pairs[idx], 16);
        }
        return out;
    }

    /**
     * An answer refusing a name the user may not invent.
     * @param name The refused name
     * @return JSON answer
     */
    private static String refuse(final String name) {
        return Session.error(
            String.format(
                "The name \"%s\" is not one I can invent, use letters, digits and underscores",
                name
            )
        );
    }

    /**
     * An answer reporting a failure.
     * @param message What went wrong
     * @return JSON answer
     */
    private static String error(final String message) {
        return String.format(
            "{\"error\":\"%s\"}",
            Session.json(message == null ? "unknown failure" : message)
        );
    }

    /**
     * Escape a string, so it can be a JSON string value.
     * @param raw The string
     * @return The same string, escaped
     */
    private static String json(final String raw) {
        final StringBuilder out = new StringBuilder(raw.length());
        for (final char chr : raw.toCharArray()) {
            switch (chr) {
                case '"':
                    out.append("\\\"");
                    break;
                case '\\':
                    out.append("\\\\");
                    break;
                case '\n':
                    out.append("\\n");
                    break;
                case '\r':
                    out.append("\\r");
                    break;
                case '\t':
                    out.append("\\t");
                    break;
                default:
                    if (chr < 0x20) {
                        out.append(String.format("\\u%04x", (int) chr));
                    } else {
                        out.append(chr);
                    }
                    break;
            }
        }
        return out.toString();
    }
}
