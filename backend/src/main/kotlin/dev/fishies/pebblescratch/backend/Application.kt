package dev.fishies.pebblescratch.backend

import io.ktor.server.application.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.mapNotNull
import kotlin.time.Duration.Companion.seconds

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    routing {
        install(WebSockets) {
            pingPeriod = 5.seconds
            timeout = 15.seconds
            maxFrameSize = Long.MAX_VALUE
            masking = false
        }

        val websocketForwarder = MutableSharedFlow<Pair<String, Frame>>()

        webSocket("/from-page/{id}") {
            val id = call.parameters["id"] ?: error("ID must be provided")
            for (frame in incoming) {
                websocketForwarder.emit(id to frame)
            }
        }

        webSocket("/to-phone/{id}") {
            val id = call.parameters["id"] ?: error("ID must be provided")
            websocketForwarder.mapNotNull { (frameId, frame) -> frame.takeIf { frameId == id } }.collect(::send)
        }
    }
}
