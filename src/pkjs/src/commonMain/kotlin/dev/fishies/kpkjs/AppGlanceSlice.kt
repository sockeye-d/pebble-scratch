package dev.fishies.kpkjs

data class AppGlanceSlice(
    @JsName("expirationTime")
    val expirationTime: String?,
    @JsName("layout")
    val layout: Layout,
) {
    data class Layout(
        @JsName("icon")
        val icon: String,
        @JsName("subtitleTemplateString")
        val subtitleTemplateString: String,
    )
}
