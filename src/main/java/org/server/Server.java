package org.server;

import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public final class Server {
    private static final List<Row> history = new ArrayList<>();

    private static final List<String> X_VALUES =
            List.of("-4", "-3", "-2", "-1", "0", "1", "2", "3", "4");

    private static final List<String> R_VALUES =
            List.of("1", "1.5", "2", "2.5", "3");

    private static final Pattern NUMBER_PATTERN =
            Pattern.compile("[+-]?[0-9]+([.,][0-9]+)?");

    private record Row(
            int x,
            double y,
            double r,
            boolean hit,
            String time,
            long workTime
    ) {
        String toJson() {
            return "{\"x\":" + x
                    + ",\"y\":" + y
                    + ",\"r\":" + r
                    + ",\"hit\":" + hit
                    + ",\"time\":\"" + time + "\""
                    + ",\"workTime\":" + workTime
                    + "}";
        }
    }

    public static void main(String[] args) {
        FCGIInterface fastCGI = new FCGIInterface();

        while (fastCGI.FCGIaccept() >= 0) {
            long start = System.nanoTime();

            try {
                String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");

                if (method.equals("GET")) {
                    send("200 OK", response(List.of()));
                    continue;
                }

                if (!method.equals("POST")) {
                    send("405 Method Not Allowed", "{\"ok\":false,\"error\":\"Используйте GET или POST\"}");
                    continue;
                }

                Map<String, List<String>> params = parse(readBody());

                if (params.containsKey("clear")) {
                    history.clear();
                    send("200 OK", response(List.of()));
                    continue;
                }

                List<String> xs = params.get("X");
                List<String> ys = params.get("Y");
                List<String> rs = params.get("R");

                if (xs == null || xs.isEmpty()) {
                    throw new IllegalArgumentException("Выберите хотя бы одно значение X");
                }

                if (ys == null || ys.size() != 1) {
                    throw new IllegalArgumentException("Укажите одно значение Y");
                }

                if (rs == null || rs.isEmpty()) {
                    throw new IllegalArgumentException("Выберите хотя бы одно значение R");
                }

                List<Integer> xValues = new ArrayList<>();
                List<Double> rValues = new ArrayList<>();

                for (String value : xs) {
                    xValues.add(parseX(value));
                }

                double y = parseY(ys.getFirst());

                for (String value : rs) {
                    rValues.add(parseR(value));
                }

                List<Row> current = new ArrayList<>();
                String time = Instant.now()
                        .truncatedTo(ChronoUnit.MILLIS)
                        .toString();

                for (int x : xValues) {
                    for (double r : rValues) {
                        boolean hit = HitChecker.isHit(x, y, r);
                        long workTime = (System.nanoTime() - start) / 1_000;

                        current.add(new Row(
                                x,
                                y,
                                r,
                                hit,
                                time,
                                workTime
                        ));
                    }
                }
                history.addAll(current);
                send("200 OK", response(current));


            } catch (IllegalArgumentException e) {
                send("400 Bad Request", "{\"ok\":false,\"error\":\"" + e.getMessage() + "\"}");
            } catch (IOException e) {
                send("400 Bad Request", "{\"ok\":false,\"error\":\"Не удалось прочитать запрос\"}");
            } catch (Exception e) {
                e.printStackTrace(System.err);
                send("500 Internal Server Error", "{\"ok\":false,\"error\":\"Внутренняя ошибка сервера\"}");
            }

        }
    }

    private static Map<String, List<String>> parse(String body) {
        Map<String, List<String>> params = new HashMap<>();

        if (body.isEmpty()) {
            return params;
        }

        for (String pair : body.split("&", -1)) {
            String[] parts = pair.split("=", 2);

            if (parts.length != 2) {
                throw new IllegalArgumentException("Некорректные параметры запроса");
            }

            String name;
            String value;

            try {
                name = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);

                value = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Некорректное кодирование параметров");
            }

            if (!params.containsKey(name)) {params.put(name, new ArrayList<>());}

            params.get(name).add(value);
        }

        return params;
    }


    private static String readBody() throws IOException {
        String value = FCGIInterface.request.params.getProperty("CONTENT_LENGTH", "0");

        int length;

        try {
            length = Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Некорректный размер запроса");
        }

        if (length < 0 || length > 16384) {
            throw new IllegalArgumentException("Некорректный размер запроса");
        }

        byte[] body = new byte[length];

        for (int i = 0; i < length; i++) {
            int next = System.in.read();

            if (next == -1) {
                throw new IOException("Запрос получен не полностью");
            }

            body[i] = (byte) next;
        }

        return new String(body, StandardCharsets.UTF_8);
    }

    private static int parseX(String value) {
        if (!X_VALUES.contains(value)) {
            throw new IllegalArgumentException("X должен быть одним из: -4, -3, -2, -1, 0, 1, 2, 3, 4");
        }

        return Integer.parseInt(value);
    }

    private static double parseY(String value) {
        if (!NUMBER_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Y должен быть числом от -3 до 3");
        }

        double y = Double.parseDouble(value.replace(',', '.'));

        if (!Double.isFinite(y) || y < -3 || y > 3) {
            throw new IllegalArgumentException("Y должен быть числом от -3 до 3");
        }

        return y;
    }

    private static double parseR(String value) {
        if (!R_VALUES.contains(value)) {
            throw new IllegalArgumentException("R должен быть одним из: 1, 1.5, 2, 2.5, 3");
        }

        return Double.parseDouble(value);
    }

    private static String response(List<Row> current) {
        return "{\"ok\":true"
                + ",\"current\":" + rowsToJson(current)
                + ",\"history\":" + rowsToJson(history)
                + "}";
    }

    private static String rowsToJson(List<Row> rows) {
        StringBuilder json = new StringBuilder("[");

        for (int i = 0; i < rows.size(); i++) {
            if (i > 0) {
                json.append(',');
            }

            json.append(rows.get(i).toJson());
        }

        return json.append(']').toString();
    }

    private static void send(String status, String body) {
        byte[] content = body.getBytes(StandardCharsets.UTF_8);

        String head = "Status: " + status + "\r\n"
                + "Content-Type: application/json; charset=UTF-8\r\n"
                + "Content-Length: " + content.length + "\r\n"
                + "Cache-Control: no-store\r\n"
                + "\r\n";

        byte[] header = head.getBytes(StandardCharsets.US_ASCII);

        System.out.write(header, 0, header.length);
        System.out.write(content, 0, content.length);
        System.out.flush();
    }
}
