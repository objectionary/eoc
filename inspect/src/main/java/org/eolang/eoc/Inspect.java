/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;

import java.io.IOException;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import org.eolang.Phi;
import org.takes.Request;
import org.takes.Take;
import org.takes.facets.fork.FkRegex;
import org.takes.facets.fork.TkFork;
import org.takes.http.Exit;
import org.takes.http.FtBasic;
import org.takes.rq.RqHref;
import org.takes.rs.RsText;
import org.takes.rs.RsWithType;

/**
 * The server behind the {@code eoc inspect} command.
 *
 * <p>It is started by the JavaScript side as a background process, with
 * the linked program on the classpath, and it answers HTTP requests about
 * the tree of objects that lives in its own memory. The objects of the
 * program are all loaded once, at startup, before the server answers its
 * first question, and nothing is read from XMIR: the objects are asked
 * directly.</p>
 *
 * @since 0.0.0
 */
public final class Inspect {

    /**
     * Command line arguments the server was started with.
     */
    private final List<String> flags;

    /**
     * Ctor.
     * @param args Command line arguments
     */
    public Inspect(final String... args) {
        this.flags = Arrays.asList(args);
    }

    /**
     * Entry point.
     * @param args Command line arguments
     * @throws IOException If fails
     */
    public static void main(final String... args) throws IOException {
        new Inspect(args).start();
    }

    /**
     * Start the server and serve until the process is killed.
     *
     * @todo #500:30min Answer the rm verb, or refuse it explicitly.
     *  Here rm (or -foo) takes an attribute away from the object we are
     *  at, and eo-runtime keeps no door open for that: PhDefault holds
     *  its attributes in a private map with no removal API, and even the
     *  Map.remove call on that map is a silent no-op, since its
     *  entrySet() is a fresh copy. Either teach the runtime to remove
     *  attributes first, or answer rm here with an explicit refusal,
     *  instead of letting the session believe the attribute is gone.
     * @todo #500:30min Answer the dataize verb.
     *  Here dataize (or run) dataizes the object the session is at and
     *  answers with its bytes, which the JavaScript side prints the way
     *  the session in the issue shows. A program that fails to dataize is
     *  the reason this tool exists, so answer with the failure instead of
     *  letting the server die on it.
     * @throws IOException If fails
     */
    public void start() throws IOException {
        new FtBasic(this.fork(new Session(Phi.Φ)), this.port()).start(Exit.NEVER);
    }

    /**
     * The routes the server answers, all of them working against one
     * session.
     * @param session The state the verbs work against
     * @return The take to route with
     */
    TkFork fork(final Session session) {
        return new TkFork(
            new FkRegex(
                "/",
                (Take) req -> new RsWithType.Json(
                    new RsText(String.format("{\"forma\":\"%s\"}", session.forma()))
                )
            ),
            new FkRegex(
                "/cp",
                (Take) req -> new RsWithType.Json(
                    new RsText(session.cp(Inspect.param(req, "name")))
                )
            ),
            new FkRegex(
                "/dd",
                (Take) req -> new RsWithType.Json(
                    new RsText(
                        session.dd(
                            Inspect.param(req, "attr"),
                            Inspect.param(req, "name")
                        )
                    )
                )
            ),
            new FkRegex(
                "/add",
                (Take) req -> new RsWithType.Json(
                    new RsText(session.add(Inspect.param(req, "name")))
                )
            ),
            new FkRegex(
                "/ls",
                (Take) req -> new RsWithType.Json(new RsText(session.ls()))
            ),
            new FkRegex(
                "/go",
                (Take) req -> new RsWithType.Json(
                    new RsText(session.go(Inspect.param(req, "name")))
                )
            ),
            new FkRegex(
                "/up",
                (Take) req -> new RsWithType.Json(new RsText(session.up()))
            ),
            new FkRegex(
                "/form",
                (Take) req -> new RsWithType.Json(
                    new RsText(session.form(Inspect.param(req, "slot")))
                )
            ),
            new FkRegex(
                "/put",
                (Take) req -> new RsWithType.Json(
                    new RsText(
                        session.put(
                            Inspect.param(req, "slot"),
                            Inspect.param(req, "data")
                        )
                    )
                )
            ),
            new FkRegex(
                "/to",
                (Take) req -> new RsWithType.Json(
                    new RsText(
                        session.to(
                            Inspect.param(req, "slot"),
                            Inspect.param(req, "name")
                        )
                    )
                )
            )
        );
    }

    /**
     * The first value of a query parameter, or an empty string.
     * @param req The request
     * @param name The name of the parameter
     * @return The value, or an empty string when absent
     * @throws IOException If reading the request fails
     */
    private static String param(final Request req, final String name) throws IOException {
        String value = "";
        final Iterator<String> found = new RqHref.Base(req).href().param(name).iterator();
        if (found.hasNext()) {
            value = found.next();
        }
        return value;
    }

    /**
     * The port to listen on, taken from the {@code --port} option.
     * @return The port number
     */
    private int port() {
        final int idx = this.flags.indexOf("--port");
        if (idx < 0 || idx + 1 == this.flags.size()) {
            throw new IllegalArgumentException(
                "The --port option is mandatory, as in \"--port 8080\""
            );
        }
        return Integer.parseInt(this.flags.get(idx + 1));
    }
}
