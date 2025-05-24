/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */
package org.eolang;

import java.io.IOException;
import org.junit.jupiter.api.Test;

/**
 * Smoke test to ensure that {@link Inspect} server starts without throwing exceptions.
 * <p>
 * This test launches the server in a separate thread to verify startup stability.
 * Functional behavior is tested in {@code test_inspect.js}.
 * </p>
 *
 * @since 0.29.0
 */
final class InspectSmokeTest {
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
        server.setDaemon(false);
        server.start();
        Thread.sleep(2000L);
        server.interrupt();
        server.join(1000L);
    }
}
