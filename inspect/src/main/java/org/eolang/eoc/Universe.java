/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeSet;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import org.eolang.Phi;

/**
 * Every object of the program, loaded once.
 *
 * <p>A package object learns that a child exists only when that child is
 * taken by name, so a tree reached lazily can never be listed. The names
 * are therefore read once from the jars on the classpath and every one of
 * them is taken, which is the only moment the classpath is looked at: from
 * then on the objects answer for themselves.</p>
 *
 * @since 0.0.0
 */
final class Universe {

    /**
     * The classpath to read the names from.
     */
    private final String classpath;

    /**
     * Ctor.
     * @param path The classpath, as {@code java.class.path} spells it
     */
    Universe(final String path) {
        this.classpath = path;
    }

    /**
     * Every object of the program, by the name it goes by.
     *
     * <p>An object that refuses to be built is left out rather than
     * stopping the whole load: this tool exists for programs that do not
     * run, so one broken object must not hide the rest of them.</p>
     *
     * @return The objects
     * @throws IOException If a jar cannot be read
     */
    Map<String, Phi> objects() throws IOException {
        final Map<String, Phi> found = new LinkedHashMap<>(0);
        for (final String name : this.names()) {
            try {
                found.put(name, Phi.Φ.take(name));
            // @checkstyle IllegalCatchCheck (1 line)
            } catch (final RuntimeException ex) {
                continue;
            }
        }
        return found;
    }

    /**
     * The name of every object the jars declare.
     * @return The names, in the order they sort
     * @throws IOException If a jar cannot be read
     */
    private Collection<String> names() throws IOException {
        final Collection<String> found = new TreeSet<>();
        for (final String part : this.classpath.split(File.pathSeparator)) {
            final File jar = new File(part);
            if (!part.endsWith(".jar") || !jar.isFile()) {
                continue;
            }
            try (JarFile opened = new JarFile(jar)) {
                final Enumeration<JarEntry> entries = opened.entries();
                while (entries.hasMoreElements()) {
                    final String entry = entries.nextElement().getName();
                    if (entry.startsWith("org/eolang/EO") && entry.endsWith(".class")
                        && entry.indexOf('$') < 0) {
                        found.add(this.eo(entry));
                    }
                }
            }
        }
        return found;
    }

    /**
     * The name an entry of a jar goes by in EO.
     *
     * <p>The inverse of what {@code JavaPath} does on the way in: a package
     * segment carries an {@code EO_} prefix and the object itself an
     * {@code EO} one, a dash of the name is written as an underscore and an
     * underscore of the name as two.</p>
     *
     * @param entry The path of the entry inside the jar
     * @return The name in EO notation, without the leading global package
     */
    private String eo(final String entry) {
        final StringBuilder out = new StringBuilder(entry.length());
        for (final String segment
            : entry.substring("org/eolang/".length(), entry.length() - ".class".length())
                .split("/")) {
            if (out.length() > 0) {
                out.append('.');
            }
            final String name;
            if (segment.startsWith("EO_")) {
                name = segment.substring("EO_".length());
            } else {
                name = segment.substring("EO".length());
            }
            out.append(name.replace("__", " ").replace('_', '-').replace(' ', '_'));
        }
        return out.toString();
    }
}
