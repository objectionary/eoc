/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

package org.eolang.eoc;

import org.eolang.AtVoid;
import org.eolang.PhDefault;
import org.eolang.Phi;
import org.hamcrest.MatcherAssert;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

/**
 * Test case for {@link Session}.
 *
 * @since 0.0.0
 */
final class SessionTest {

    @Test
    void keepsCopyUnderInventedName() {
        final Phi origin = new PhDefault();
        final Session session = new Session(origin);
        final String answer = session.cp("bar");
        MatcherAssert.assertThat(
            String.format("cp does not confirm the name it attached: %s", answer),
            answer,
            Matchers.containsString("\"copied\":\"Φ.bar\"")
        );
        final Phi copy = session.invented("Φ.bar");
        MatcherAssert.assertThat(
            "cp attached the origin itself instead of a copy of it",
            copy,
            Matchers.not(Matchers.sameInstance(origin))
        );
    }

    @Test
    void copyKeepsItsOwnAttributes() {
        final PhDefault origin = new PhDefault();
        final Session session = new Session(origin);
        session.cp("bar");
        final PhDefault copy = (PhDefault) session.invented("Φ.bar");
        copy.add("fresh", new AtVoid("fresh"));
        MatcherAssert.assertThat(
            "the origin sees the attribute registered on the copy",
            origin.φTerm().contains("fresh"),
            Matchers.equalTo(false)
        );
        MatcherAssert.assertThat(
            "the copy does not keep the attribute it registered",
            copy.φTerm().contains("fresh"),
            Matchers.equalTo(true)
        );
    }

    @Test
    void dispatchesAttributeUnderInventedName() {
        final PhDefault origin = new PhDefault();
        origin.add("foo", new AtVoid("foo"));
        origin.put("foo", new PhDefault());
        final Session session = new Session(origin);
        final String answer = session.dd("foo", "x");
        MatcherAssert.assertThat(
            String.format("dd does not confirm what it dispatched: %s", answer),
            answer,
            Matchers.containsString("\"dispatched\":\"Φ.x\"")
        );
        MatcherAssert.assertThat(
            String.format("dd answers with a wrong forma: %s", answer),
            answer,
            Matchers.containsString("\"forma\":\"[]\"")
        );
        MatcherAssert.assertThat(
            "dd keeps a different object than the attribute holds",
            session.invented("Φ.x"),
            Matchers.sameInstance(origin.take("foo"))
        );
    }

    @Test
    void refusesNamesItCannotInvent() {
        final Session session = new Session(new PhDefault());
        for (final String name : new String[] {"", "Φ.bar", "a-b", "a b", "a.b"}) {
            MatcherAssert.assertThat(
                String.format("cp accepts the invented name \"%s\"", name),
                session.cp(name).contains("\"error\""),
                Matchers.equalTo(true)
            );
            MatcherAssert.assertThat(
                String.format("dd accepts the invented name \"%s\"", name),
                session.dd("foo", name).contains("\"error\""),
                Matchers.equalTo(true)
            );
        }
    }

    @Test
    void reportsTheFailureTheRuntimeGives() {
        final Phi root = SessionTest.broken("no such attribute");
        final Session session = new Session(root);
        final String answer = session.dd("foo", "x");
        MatcherAssert.assertThat(
            String.format("dd hides the failure of the runtime: %s", answer),
            answer,
            Matchers.containsString("\"error\":\"no such attribute\"")
        );
    }

    @Test
    void escapesControlCharactersInTheFailure() {
        final Phi root = SessionTest.broken(String.format("boom%sbang", '\u0001'));
        final Session session = new Session(root);
        final String answer = session.dd("foo", "x");
        MatcherAssert.assertThat(
            String.format("dd sends a raw control character out: %s", answer),
            answer,
            Matchers.containsString("\\u0001")
        );
    }

    /**
     * An object that refuses to be asked about attributes.
     * @param message The failure to report
     * @return The broken object
     */
    private static Phi broken(final String message) {
        return new Phi() {
            @Override
            public Phi copy() {
                return this;
            }

            @Override
            public boolean needsRho() {
                return false;
            }

            @Override
            public Phi take(final String name) {
                throw new IllegalStateException(message);
            }

            @Override
            public void put(final int pos, final Phi obj) {
                throw new IllegalStateException(message);
            }

            @Override
            public void put(final String name, final Phi obj) {
                throw new IllegalStateException(message);
            }

            @Override
            public String locator() {
                return "?";
            }

            @Override
            public String forma() {
                return "broken";
            }

            @Override
            public Phi normalized() {
                return this;
            }

            @Override
            public byte[] delta() {
                return new byte[0];
            }

            @Override
            public String φTerm() {
                return "broken";
            }
        };
    }
}
