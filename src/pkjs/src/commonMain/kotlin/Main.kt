import dev.fishies.kpkjs.KPebble
import dev.fishies.kpkjs.gen.MessageKeys
import kotlinx.browser.localStorage

const val handlerByteCount = 5

const val workspaceStorageKey = "workspace"
external fun encodeURIComponent(str: String): String
external fun atob(base64: String): String

fun base64ToByteArray(base64: String): ByteArray {
    val binaryString = atob(base64)
    return ByteArray(binaryString.length) { binaryString[it].code.toByte() }
}

@OptIn(ExperimentalWasmJsInterop::class)
fun main() {
    KPebble.events.onReady {
        println("Ready")
    }

    KPebble.message {
        println("sending message...")
        val data = js("{}")
        data[MessageKeys.Ack] = "Ack"
        try {
            send(data)
            println("Success")
        } catch (e: Exception) {
            println("Failed to send message.")
        }
    }

    KPebble.events.onConfigure {
        val savedData = localStorage.getItem(workspaceStorageKey)
        println("savedData: $savedData")
        val url = buildString {
            append("http://192.168.1.219:8080/")
            if (savedData != null) {
                append("?workspace=${encodeURIComponent(savedData)}")
            }
        }
        val response = JSON.parse<ScratchResponse>(show(url))
        println("Result was ${JSON.stringify(response)}")
        val wsSerialized = JSON.stringify(response.ws)
        localStorage.setItem(workspaceStorageKey, wsSerialized)
        println("wsSerialized: $wsSerialized")
        KPebble.message {
            val bytecode = response.bytecode.flatMap(::explodeInt)

            val headerData = js("{}")
            headerData[MessageKeys.BytecodeHeader] = bytecode.size
            send(headerData)
            val bytecodeChunked = bytecode.chunked(16)
            for ((index, bytecode) in bytecodeChunked.withIndex()) {
                println("Sending chunk ${index + 1}/${bytecodeChunked.size} ")
                val bodyData = js("{}")
                bodyData[MessageKeys.Bytecode] = bytecode.toTypedArray()
                send(bodyData)
            }

            val handlers =
                (js("Object.entries")(response.handlers) as Array<Array<dynamic>>).map { (k: String, v: Array<Int>) ->
                    k to v
                }.flatMap { (event, handlers) ->
                    handlers.flatMap {
                        (listOf(event.toInt()) + explodeInt(it)).also { bytes ->
                            require(bytes.size == handlerByteCount) { "Expected $handlerByteCount bytes, found ${bytes.size} bytes" }
                        }
                    }
                }
            println("handlers: $handlers")
            for (handler in handlers.chunked(handlerByteCount * 4)) {
                val handlerData = js("{}")
                handlerData[MessageKeys.Handlers] = handler
                send(handlerData)
            }
            val finalData = js("{}")
            finalData[MessageKeys.TransmissionComplete] = 0
            send(finalData)
        }
    }
}

private fun explodeInt(i: Int): List<Int> =
    listOf(i ushr 0 and 0xFF, i ushr 8 and 0xFF, i ushr 16 and 0xFF, i ushr 24 and 0xFF)

external interface ScratchResponse {
    val ws: String
    val bytecode: Array<Int>
    val handlers: dynamic
}
