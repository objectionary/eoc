/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
package org.eolang;

import java.io.IOException;
import org.takes.Request;
import org.takes.Response;
import org.takes.Take;
import org.takes.facets.fork.FkRegex;
import org.takes.facets.fork.TkFork;
import org.takes.http.FtBasic;
import org.takes.rq.RqPrint;
import org.takes.rs.RsText;

/**
 * HTTP inspection server.
 * @since 0.29.0
 */
public final class Inspect {
    /**
     * Prevents instantiation (required by qulice UseUtilityClass rule).
     */
    private Inspect() {
        // Intentionally empty
    }

    /**
     * Main entry point.
     * @param args Command line arguments
     * @throws IOException If server fails to start
     */
    public static void main(final String... args) throws IOException {
        new FtBasic(
            new TkFork(
                new FkRegex(
                    "/echo",
                    (Take) req -> new RsText(new RqPrint(req).printBody())
                ),
                new FkRegex(
                    "/",
                    new RsText("Server is running. Use /echo endpoint")
                )
            ),
            8080
        ).start(() -> Thread.currentThread().isInterrupted());
    }
}
