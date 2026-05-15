package dev.fishies.kpkjs

import kotlin.coroutines.Continuation
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.resume
import kotlin.coroutines.startCoroutine
import kotlin.coroutines.suspendCoroutine

sealed class KPebble {
    val pebble: Pebble = js("Pebble")
    val events = Events()

    fun message(block: suspend AppMessageScope.() -> Unit = {}) =
        block.startCoroutine(AppMessageScopeImpl(), exceptionPropagatingContinuation())

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
        suspend fun show(url: String): String
    }

    inner class Events internal constructor() {
        fun onReady(callback: () -> Unit) = pebble.addEventListener("ready", callback)

        fun onAppMessage(callback: (payload: dynamic) -> Unit) = pebble.addEventListener("appmessage", callback)

        fun onConfigure(callback: suspend ConfigurationCallbackScope.() -> Unit) {
            pebble.addEventListener("showConfiguration") {
                callback.startCoroutine(ConfigurationCallbackScopeImpl(), exceptionPropagatingContinuation())
            }
        }
    }

    private inner class ConfigurationCallbackScopeImpl : ConfigurationCallbackScope {
        var c: Continuation<dynamic>? = null
        override suspend fun show(url: String): dynamic {
            var webViewClosedCallback: ((dynamic) -> Unit)? = null

            webViewClosedCallback = { data: dynamic ->
                pebble.removeEventListener("webviewclosed", webViewClosedCallback)
                c?.resume(data.response)
            }
            pebble.addEventListener("webviewclosed", webViewClosedCallback)

            pebble.openURL(url)
            return suspendCoroutine { c = it }
        }
    }

    companion object : KPebble()

    private fun <T> exceptionPropagatingContinuation(): Continuation<T> = Continuation(EmptyCoroutineContext) { r ->
        r.exceptionOrNull()?.let { throw it }
    }
}
