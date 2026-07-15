import dev.fishies.kpkjs.KPebble
import kotlinx.browser.localStorage

const val workspaceStorageKey = "workspace"
external fun encodeURIComponent(str: String): String
external fun atob(base64: String): String

fun base64ToByteArray(base64: String): ByteArray {
    val binaryString = atob(base64)
    return ByteArray(binaryString.length) { binaryString[it].code.toByte() }
}

fun main() {
    KPebble.events.onReady {
        println("Ready")
    }

    KPebble.message {
        println("sending message...")
        val data = js("{}")
        data["Ack"] = "Ack"
        try {
            send(data)
            println("Success")
        } catch (e: Exception) {
            println("Failed to send message.")
        }
    }

    KPebble.events.onConfigure {
        val savedData = localStorage.getItem(workspaceStorageKey)
        val url = buildString {
            append("http://192.168.1.219:8080/")
            if (savedData != null) {
                append("?workspace=${encodeURIComponent(savedData)}")
            }
        }
        val response = JSON.parse<ScratchResponse>(show(url))
        println("Result was ${JSON.stringify(response)}")
        localStorage.setItem(workspaceStorageKey, JSON.stringify(response.ws))
        val byteArray = base64ToByteArray(response.bytecode)
        println("Bytes are ${byteArray.contentToString()}")
        KPebble.message {
            println("sending message...")
            val data = js("{}")
            data["Bytecode"] = byteArray.toTypedArray()
            println("Result was ${JSON.stringify(data)}")
            try {
                send(data)
                println("Success")
            } catch (e: Exception) {
                println("Failed to send message.")
            }
        }
    }
}

external interface ScratchResponse {
    val ws: String
    val bytecode: String
    val handlers: dynamic
}
