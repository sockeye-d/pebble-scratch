package dev.fishies.kpkjs

external interface Pebble {
    fun addEventListener(type: String, callback: dynamic)
    fun removeEventListener(type: String, callback: dynamic)

    fun showSimpleNotificationOnPebble(title: String, body: String)
    fun sendAppMessage(data: dynamic, onSuccess: () -> Unit, onFailure: () -> Unit)

    fun getTimelineToken(onSuccess: (token: String) -> Unit, onFailure: () -> Unit)
    fun timelineSubscribe(topic: String, onSuccess: () -> Unit, onFailure: () -> Unit)
    fun timelineUnsubscribe(topic: String, onSuccess: () -> Unit, onFailure: () -> Unit)
    fun timelineSubscriptions(onSuccess: (topics: List<String>) -> Unit, onFailure: () -> Unit)

    fun getActiveWatchInfo(): WatchInfo
    fun getAccountToken(): String
    fun getWatchToken(): String

    fun appGlanceReload(
        appGlanceSlices: List<AppGlanceSlice>,
        onSuccess: (appGlanceSlices: List<AppGlanceSlice>) -> Unit,
        onFailure: (appGlanceSlices: List<AppGlanceSlice>) -> Unit,
    )

    fun openURL(url: String)
}
