/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;


import org.eolang.PhDefault;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.takes.rq.RqFake;
import org.takes.rs.RsPrint;

/**
 * Test case for {@link Inspect} routes.
 *
 * @since 0.0.0
 */
final class InspectTest {

    @Test
    void answersWithTheFormaOfTheSession() throws Exception {
        MatcherAssert.assertThat(
            "the root route does not answer with the forma of the session",
            InspectTest.body("/", "root"),
            Matchers.containsString("{\"forma\":\"root\"}")
        );
    }

    @Test
    void routesCpToTheSession() throws Exception {
        MatcherAssert.assertThat(
            "the cp route does not reach the session",
            InspectTest.body("/cp?name=bar", "root"),
            Matchers.containsString("\"copied\":\"Φ.bar\"")
        );
    }

    @Test
    void routesDdToTheSession() throws Exception {
        MatcherAssert.assertThat(
            "the dd route does not reach the session",
            InspectTest.body("/dd?attr=foo&name=x", "root"),
            Matchers.containsString("\"error\"")
        );
    }

    @Test
    void refusesARequestWithoutParameters() throws Exception {
        MatcherAssert.assertThat(
            "the cp route answers without an error on a missing name",
            InspectTest.body("/cp", "root"),
            Matchers.containsString("\"error\"")
        );
    }

    /**
     * The body the fork answers the URI with, the session being at an
     * object of the given forma.
     * @param uri The URI to ask
     * @param forma The forma the session object reports
     * @return The body
     * @throws Exception If fails
     */
    private static String body(final String uri, final String forma) throws Exception {
        return new RsPrint(
            new Inspect("--port", "8080").fork(new Session(new InspectTest.At(forma))).act(
                new RqFake("GET", uri)
            )
        ).printBody();
    }

    /**
     * An object that only knows its forma.
     * @since 0.0.0
     */
    private static final class At extends PhDefault {

        /**
         * The forma to report.
         */
        private final String shape;

        /**
         * Ctor.
         * @param shape The forma to report
         */
        At(final String shape) {
            super();
            this.shape = shape;
        }

        @Override
        public String forma() {
            return this.shape;
        }
    }
}
