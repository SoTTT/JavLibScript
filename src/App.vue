<template>
    <div id="root" style="bottom: 100px; right: 100px;">
        <div id="header" class="not-select" @mousedown.native="onHeaderMousedown" @mousemove.native="onHeaderMousemove"
            @mouseup.native="onHeaderMouseup"></div>
        <div id="wrapper" class="not-select">
            <textarea v-model.trim="videoList" name="code" id="code-input" cols="40" rows="10"></textarea>
            <dir id="button-layout" class="not-select">
                <div id="check-button" class="button" @click="onCheckButtonClick">检查</div>
                <div id="copy-button" class="button" @click="onCopyButtonClick">复制</div>
                <div id="flag-button" class="button" @click="onFlagButtonClick">标记</div>
                <div id="clear-button" class="button" @click="onClearButtonClick">清除</div>
            </dir>
        </div>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            old_x: "",
            old_y: "",
            isDraw: false,
            videoList: "",
            working: false,
        }
    },
    computed: {
        tool: function () {
            return document.querySelector("#root")
        }
    },
    methods: {
        onCopyButtonClick: function () {
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
            GM_setClipboard(value, "text");
        },
        onCheckButtonClick: function () {
            let value = document.querySelector("#code-input").value.trim();
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
        },
        onHeaderMousedown: function (event) {
            console.log("down");
            this.old_x = event.screenX
            this.old_y = event.screenY
            this.isDraw = true;
        },
        onHeaderMousemove: function (event) {
            console.log("up");
            if (this.isDraw) {
                let toolStyle = this.tool.style;
                let bottom = toolStyle.bottom;
                let right = toolStyle.right;
                this.tool.style.bottom = `${parseInt(bottom) - (event.screenY - this.old_y)}px`
                this.old_y = event.screenY
                this.tool.style.right = `${parseInt(right) - (event.screenX - this.old_x)}px`
                this.old_x = event.screenX
            }
        },
        onHeaderMouseup: function () {
            console.log("up");
            this.isDraw = false;
        },
        saveWorkingState: function () {
            GM_setValue("video-list", this.videoList)
            GM_setValue("working", this.working)
        },
        loadWorkingState: function () {
            this.videoList = GM_getValue("video-list")
            this.working = GM_getValue("working")
        },
        onFlagButtonClick: function () {
            console.log("flag");
            let list = document.querySelectorAll("table.videotextlist tbody tr")
            if (list !== null) {

                this.working = true
                this.saveWorkingState()

                for (let index = 1; index < list.length; index++) {
                    const element = list[index];
                    let input = element.querySelector("input")
                    let title = element.querySelector("a")
                    let code = title.innerText.split(" ")[0]
                    let flagListSting = GM_getValue("flag-list-string")
                    if (flagListSting !== undefined) {
                        if (flagListSting.trim().split(" ").indexOf(code) !== -1) {
                            continue;
                        }
                    }
                    if (input.checked === true) {
                        let link = element.querySelector("a")
                        console.log(`working=${this.working}`);
                        link.click()
                    }
                }

                this.working = false
                this.saveWorkingState()
                console.log(GM_getValue("flag-list-string"));
            }
        },
        onClearButtonClick: function () {
            GM_setValue("flag-list-string", "")
        }
    },
    watch: {
        videoList: function (newVal, oldVal) {
            GM_setValue("video-list", this.videoList)
        }
    },
    mounted: function () {
        this.loadWorkingState()
        console.log(`working=${this.working}`);
        console.log(`videoList=${this.videoList}`);

        let element = document.querySelector("#owned")
        if (element !== null) {
            console.log("is video detail page");

            // if (this.working !== true) {
            //     return
            // }

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
            // if (this.working !== true) {
            //     return
            // }
            this.onCheckButtonClick()
            this.onFlagButtonClick()
        }
    }
}
</script>

<style>
textarea {
    resize: none;
}

.not-select {
    user-select: none;
}

#wrapper {
    padding: 10px;
    flex-direction: column;
}

#root {
    background-color: brown;
    position: fixed;
    display: flex;
    flex-direction: column;
    width: auto;
    height: auto;
    border-radius: 10px;
}

#button-layout {
    padding: 0;
    display: flex;
    width: 100%;
    height: auto;
    justify-content: space-around;
}

.button {
    text-align: center;
    line-height: 40px;
    width: 60px;
    height: 40px;
    border-radius: 5px;
    background-color: cadetblue;
}

.button:hover {
    background-color: darkcyan;
}

#header {
    overflow: hidden;
    background-color: lightslategrey;
    width: 100%;
    height: 30px;
    border-radius: 5px 5px 0px 0px;
}
</style>