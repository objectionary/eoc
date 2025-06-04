/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
package org.eolang;

import java.io.IOException;
import org.junit.jupiter.api.Test;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

/**
 * Smoke test to ensure that {@link Inspect} server starts without throwing exceptions.
 * <p>
 * This test launches the server in a separate thread to verify startup stability.
 * Functional behavior is tested in {@code test_inspect.js}.
 * </p>
 *
 * @since 0.29.0
 */
final class InspectTest {
    /**
     * Verifies that {@link Inspect#main(String[])} starts without errors.
     *
     * @throws Exception If the thread is interrupted
     */
    @Test
    void runsWithoutExceptions() throws Exception {
        final Thread server = new Thread(
            new Runnable() {
                @Override
                public void run() {
                    try {
                        Inspect.main();
                    } catch (final IOException ex) {
                        throw new IllegalStateException("IOException while starting server", ex);
                    }
                }
            }
        );
        server.start();
        final long start = System.currentTimeMillis() + 10_000L;
        while (System.currentTimeMillis() < start && !server.isAlive()) {
            Thread.sleep(100);
        }
        assertThat(
            "Server thread should be running after start",
            server.isAlive(),
            is(true)
        );
        server.interrupt();
        final long stop = System.currentTimeMillis() + 5_000L;
        while (System.currentTimeMillis() < stop && server.isAlive()) {
            Thread.sleep(100);
        }
        assertThat(
            "Server thread should be terminated after interrupt",
            server.isAlive(),
            is(false)
        );
    }
}
