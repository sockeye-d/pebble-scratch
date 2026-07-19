package dev.fishies.pebble_scratch

import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import kotlinx.html.a
import kotlinx.html.body
import kotlinx.html.head
import kotlinx.html.title

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.module() {
    routing {
        get("/") {
            call.respondHtml {
                head {
                    title {
                        +"Pebble Scratch"
                    }
                }
                body {
                    a(href = "/static/index.html") {
                        +"Go to the page"
                    }
                }
            }
        }

        route("/static") {
            staticResources("/", "static") {
            }
        }
    }
}

