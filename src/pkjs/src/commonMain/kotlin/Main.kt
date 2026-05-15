import dev.fishies.kpkjs.kPebble

fun main() {
    kPebble.events.onReady {
        println("Ready")
    }

    kPebble.message {
        println("sending message...")
        val data = js("{}")
        data["Ack"] = "Ack"

        println("Worked? ${send(data)}")
        println("Worked? ${send(data)}")
        println("Worked? ${send(data)}")
        println("Worked? ${send(data)}")
        println("Worked? ${send(data)}")
        println("Worked? ${send(data)}")
    }
}
