<template>
    <div id="root" style="bottom: 20px; right: 100px;">
        <v-card color="grey-lighten-4" flat height="auto" rounded="0">
            <v-toolbar prominent @mouseup.native="onHeaderMouseup" @mousedown.native="onHeaderMousedown">
                <v-app-bar-nav-icon icon>
                    <v-icon>mdi-menu</v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title>Tool Box</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon>
                    <v-icon>mdi-cog</v-icon>
                </v-btn>
            </v-toolbar>
            <v-container id="wrapper" class="not-select">
                <v-col>
                    <v-textarea bg-color="grey-lighten-2" no-resize auto-grow clearable clear-icon="mdi-close-circle"
                        label="codes" v-model.trim="videoList" name="code" rows="5" />
                    <v-row class="not-select">
                        <v-col>
                            <v-btn id="check-button" class="button" @click="onCheckButtonClick">检查</v-btn>
                        </v-col>
                        <v-col>
                            <v-btn id="copy-button" class="button" @click="onCopyButtonClick">复制</v-btn>
                            <v-snackbar v-model="copySnackbarStatus.visitable" :timeout="copySnackbarStatus.timeout">
                                {{ copySnackbarStatus.message }}
                                <template v-slot:actions>
                                    <v-btn id="snackbar-button" class="button"
                                        @click="copySnackbarStatus.visitable = false">close</v-btn>
                                </template>
                            </v-snackbar>
                        </v-col>
                        <v-col>
                            <v-btn id="flag-button" class="button" @click="onFlagButtonClick">标记</v-btn>
                        </v-col>
                    </v-row>
                </v-col>
            </v-container>
        </v-card>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'

const old_x = ref("")
const old_y = ref("")

const copySnackbarStatus = reactive({
    timeout: 2000,
    visitable: false,
    message: ""
})

const tool = computed(() => {
    return document.querySelector("#root")
})

const videoList = ref(GM_getValue("video-list"))
const working = ref(GM_getValue("working"))
const flagListSting = ref(GM_getValue("flag-list-string"))


watch(videoList, (newValue, oldValue) => {
    if (newValue !== oldValue)
        GM_setValue("video-list", newValue)
})

watch(working, (newValue, oldValue) => {
    if (newValue !== oldValue)
        GM_setValue("working", newValue)
})

watch(flagListSting, (newValue, oldValue) => {
    if (newValue !== oldValue)
        GM_setValue("flag-list-string", newValue)
})


onMounted(() => {
    console.log(`working=${working.value}`);
    console.log(`videoList=${videoList.value}`);

    let element = document.querySelector("#owned")
    if (element !== null) {
        console.log("is video detail page");

        if (working.value !== true) {
            return
        }

        let type = document.querySelector("#owned")
        let buttons = type.querySelectorAll("button")
        if (buttons.length !== 2) {
            console.log("count of button in owned element is not 2");
        } else if (buttons.length === 2) {
            let have = null
            if (buttons[0].innerText === "已拥有") {
                have = buttons[0]
            } else {
                have = buttons[1]
            }
            if (window.getComputedStyle(have).display !== "none") {
                have.click()

                let flagListSting = GM_getValue("flag-list-string") === undefined ? "" : GM_getValue("flag-list-string")
                flagListSting += (document.querySelector("#video_id .text").innerText + " ")
                GM_setValue("flag-list-string", flagListSting)
            }
        }
        window.history.back()
    } else {
        console.log("is wanted video page");
        if (working.value !== true) {
            return
        }
        onCheckButtonClick()
        onFlagButtonClick()
    }
})

const onCopyButtonClick = () => {
    let value = new Array();
    let list = document.querySelectorAll(".videotextlist .title");
    if (list === null) {
        return;
    }
    for (let item of list) {
        if (item.innerText === "标题") {
            continue;
        }
        let title = item.innerText;
        value.push(title.split(' ')[0]);
    }
    GM_setClipboard(value.join(" "), "text");
    copySnackbarStatus.message = `共${list.length - 1}条记录复制到剪贴板`
    copySnackbarStatus.visitable = true
}

const onCheckButtonClick = () => {
    let value = videoList.value;
    if (value.length === 0) {
        return;
    }
    let list = value.split(" ").map((value) => value.toUpperCase())
    let elementList = document.querySelectorAll(".videotextlist .title");
    for (let item of elementList) {
        let index = list.indexOf(item.innerText.split(" ")[0].toUpperCase())
        if (index !== -1) {
            let cb = item.parentElement.querySelector("input[type='checkbox']")
            cb.checked = true
        }
    }
}

const onHeaderMousedown = (event) => {
    old_x.value = event.screenX
    old_y.value = event.screenY
    addEventListener('mousemove', onHeaderMousemove);
}

const onHeaderMousemove = (event) => {
    let toolStyle = tool.value.style;
    let bottom = toolStyle.bottom;
    let right = toolStyle.right;
    tool.value.style.bottom = `${parseInt(bottom) - (event.screenY - old_y.value)}px`
    old_y.value = event.screenY
    tool.value.style.right = `${parseInt(right) - (event.screenX - old_x.value)}px`
    old_x.value = event.screenX
}

const onHeaderMouseup = () => {
    removeEventListener('mousemove', onHeaderMousemove);
}

const onFlagButtonClick = () => {
    console.log("flag");
    let list = document.querySelectorAll("table.videotextlist tbody tr")
    if (list !== null) {

        working.value = true

        for (let index = 1; index < list.length; index++) {
            const element = list[index];
            let input = element.querySelector("input")
            let title = element.querySelector("a")
            let code = title.innerText.split(" ")[0]
            if (flagListSting.value !== undefined) {
                if (flagListSting.value.trim().split(" ").indexOf(code) !== -1) {
                    continue;
                }
            }
            if (input.checked === true) {
                let link = element.querySelector("a")
                console.log(`working=${working.value}`);
                link.click()
            }
        }

        working.value = false
        console.log(flagListSting.value);
    }
}
</script>

<style>
.not-select {
    user-select: none;
}

#root {
    position: fixed;
    display: flex;
    width: 700px;
    height: auto;
}
</style>