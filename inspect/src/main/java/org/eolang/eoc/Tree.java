/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;

import java.io.File;
import java.io.IOException;
import java.util.Enumeration;
import java.util.SortedMap;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import org.eolang.Phi;

/**
 * The whole tree of objects of the program, loaded once, at startup.
 *
 * <p>A package object learns that a child exists only when that child is
 * taken by name, and the runtime keeps no door open to ask a package
 * which children it has, so a tree reached lazily can never be listed.
 * The names are therefore read once from the jars on the classpath and
 * every one of them is taken, which is the only moment the classpath is
 * looked at: from then on the objects answer for themselves.</p>
 *
 * @since 0.0.0
 */
final class Tree {

    /**
     * The prefix every object class lives under in a jar.
     */
    private static final String PKG = "org/eolang/";

    /**
     * The suffix every object class carries.
     */
    private static final String CLS = ".class";

    /**
     * The classpath to read the names from.
     */
    private final String classpath;

    /**
     * Ctor.
     * @param path The classpath, as {@code java.class.path} spells it
     */
    Tree(final String path) {
        this.classpath = path;
    }

    /**
     * Every object of the program, by the name it goes by.
     *
     * <p>An object that refuses to be built is left out rather than
     * stopping the whole load: this tool exists for programs that do not
     * run, so one broken object must not hide the rest of them.</p>
     * @return The objects, sorted by name
     * @throws IOException If a jar cannot be read
     */
    SortedMap<String, Phi> load() throws IOException {
        final SortedMap<String, Phi> tree = new TreeMap<>();
        for (final String name : this.names()) {
            try {
                tree.put(name, Phi.Φ.take(name));
            // @checkstyle IllegalCatchCheck (1 line)
            } catch (final RuntimeException ex) {
                continue;
            }
        }
        return tree;
    }

    /**
     * The name of every object the jars declare.
     * @return The names, in the order they sort
     * @throws IOException If a jar cannot be read
     */
    private Iterable<String> names() throws IOException {
        final SortedSet<String> found = new TreeSet<>();
        for (final String part : this.classpath.split(File.pathSeparator)) {
            final File jar = new File(part);
            if (part.endsWith(".jar") && jar.isFile()) {
                try (JarFile opened = new JarFile(jar)) {
                    final Enumeration<JarEntry> entries = opened.entries();
                    while (entries.hasMoreElements()) {
                        final String entry = entries.nextElement().getName();
                        if (entry.startsWith(Tree.PKG)
                            && entry.endsWith(Tree.CLS)
                            && entry.indexOf('$') < 0) {
                            found.add(Tree.eo(entry));
                        }
                    }
                }
            }
        }
        return found;
    }

    /**
     * The name an entry of a jar goes by in EO.
     *
     * <p>The inverse of what {@code org.eolang.JavaPath} does on the way
     * in: the object itself carries an {@code EO} prefix, a dash of the
     * name is written as an underscore and an underscore of the name as
     * two.</p>
     * @param entry The path of the entry inside the jar
     * @return The name in EO notation, without the leading global package
     */
    private static String eo(final String entry) {
        final String name = entry.substring(
            Tree.PKG.length() + "EO".length(),
            entry.length() - Tree.CLS.length()
        );
        return name.replace("__", " ").replace('_', '-').replace(' ', '_');
    }

}
