package org.server;

import com.fastcgi.FCGIInterface;

import java.nio.charset.StandardCharsets;

public final class Server {
    public static void main(String[] args) {
        FCGIInterface fastCGI = new FCGIInterface();

        while (fastCGI.FCGIaccept() >= 0) {
            String body = "{\"message\":\"Сервер работает\"}";

            System.out.println(
                    "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: application/json; charset=UTF-8\r\n" +
                    "Content-Length: " + body.getBytes(StandardCharsets.UTF_8).length + "\r\n\r\n" +
                    body
            );
            System.out.flush();
        }
    }
}
