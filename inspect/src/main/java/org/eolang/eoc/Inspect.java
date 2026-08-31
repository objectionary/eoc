/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.eolang.Phi;
import org.takes.Take;
import org.takes.facets.fork.FkRegex;
import org.takes.facets.fork.TkFork;
import org.takes.http.Exit;
import org.takes.http.FtBasic;
import org.takes.rs.RsText;
import org.takes.rs.RsWithType;

/**
 * The server behind the {@code eoc inspect} command.
 *
 * <p>It is started by the JavaScript side as a background process, with
 * the linked program on the classpath, and it answers HTTP requests about
 * the tree of objects that lives in its own memory. Nothing is read from
 * the classpath or from XMIR: the objects are asked directly.</p>
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
     * @todo #500:90min Answer the verbs that only read the tree.
     *  The session in this issue moves around before it changes anything:
     *  ls prints the attributes of the object we are at, go (or .foo)
     *  steps into one of them, and .. steps back out. All three need the
     *  server to remember where the session currently is, so add that
     *  position here first and let these three verbs move it.
     * @todo #500:90min Answer the verbs that change the current object.
     *  Here add (or +foo) puts a new void attribute on the object we are
     *  at, rm (or -foo) takes one away, form attaches an empty formation,
     *  put attaches data to the delta asset, and to attaches an object
     *  named elsewhere. All five write into the object, which is what the
     *  base class of objectionary/eo#6273 is meant to allow.
     * @todo #500:60min Answer the verbs that copy and dispatch.
     *  Here cp makes a copy of the object we are at and attaches it under
     *  a name the caller chooses, and dd dispatches one attribute and
     *  attaches the result the same way. Both need somewhere to keep
     *  those names, since a name like the one in the session is invented
     *  by the user and belongs to no object of the program.
     * @todo #500:30min Answer the dataize verb.
     *  Here dataize (or run) dataizes the object the session is at and
     *  answers with its bytes, which the JavaScript side prints the way
     *  the session in the issue shows. A program that fails to dataize is
     *  the reason this tool exists, so answer with the failure instead of
     *  letting the server die on it.
     * @throws IOException If fails
     */
    public void start() throws IOException {
        final Map<String, Phi> objects =
            new Universe(System.getProperty("java.class.path")).objects();
        new FtBasic(
            new TkFork(
                new FkRegex(
                    "/",
                    (Take) req -> new RsWithType.Json(
                        new RsText(
                            String.format(
                                "{\"forma\":\"%s\",\"loaded\":%d}",
                                Phi.Φ.forma(), objects.size()
                            )
                        )
                    )
                )
            ),
            this.port()
        ).start(Exit.NEVER);
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
