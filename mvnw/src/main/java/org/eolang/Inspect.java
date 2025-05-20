package org.eolang;

import org.takes.Request;
import org.takes.Response;
import org.takes.Take;
import org.takes.http.Exit;
import org.takes.http.FtBasic;
import org.takes.facets.fork.FkRegex;
import org.takes.facets.fork.TkFork;
import org.takes.rq.RqPrint;
import org.takes.rs.RsText;

import java.io.IOException;

public final class Inspect {
    public static void main(final String... args) throws Exception {
        new FtBasic(
                new TkFork(
                        new FkRegex("/echo", new Take() {
                            @Override
                            public Response act(Request req) throws IOException {
                                String body = new RqPrint(req).printBody();
                                return new RsText(body);
                            }
                        }),
                        new FkRegex("/", new RsText("Server is running. Use /echo endpoint"))
                ),
                8080
        ).start(Exit.NEVER);
    }
}