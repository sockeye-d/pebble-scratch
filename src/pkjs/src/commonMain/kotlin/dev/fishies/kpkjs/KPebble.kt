package dev.fishies.kpkjs

import kotlin.coroutines.Continuation
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.resume
import kotlin.coroutines.startCoroutine
import kotlin.coroutines.suspendCoroutine

class KPebble {
    val pebble: Pebble = js("Pebble")
    val events = Events()

    fun message(block: suspend AppMessageScope.() -> Unit = {}) =
        block.startCoroutine(AppMessageScopeImpl(), Continuation(EmptyCoroutineContext) {})

    private inner class AppMessageScopeImpl : AppMessageScope {
        var c: Continuation<Boolean>? = null
        override suspend fun send(message: dynamic): Boolean {
            // surely this is not the world's worst race condition :)
            pebble.sendAppMessage(message, {
                c?.resume(true)
            }, {
                c?.resume(false)
            })
            return suspendCoroutine { c = it }
        }
    }

    interface AppMessageScope {
        suspend fun send(message: dynamic): Boolean
    }

    interface ConfigurationCallbackScope {
        suspend fun show(url: String): dynamic
    }

    inner class Events internal constructor() {
        fun onReady(callback: () -> Unit) = pebble.addEventListener("ready", callback)

        fun onAppMessage(callback: (payload: dynamic) -> Unit) = pebble.addEventListener("appmessage", callback)

        fun onShowConfiguration(callback: suspend ConfigurationCallbackScope.() -> Unit): Unit =
            TODO() //pebble.addEventListener("showConfiguration", callback)
    }

    //private inner class AppMessageScopeImpl : AppMessageScope {
    //    override suspend fun succeeded(): Boolean {
    //        TODO("Not yet implemented")
    //    }
    //}
}

val kPebble = KPebble()
