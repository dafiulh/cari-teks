new Vue({
    el: "#app",
    data: {
        url: "youtube.com/watch?v=OrxmtDw4pVI",
        keyword: "",
        size: 10,
        info: "Masukkan kata kunci yang ingin dicari",
        results: [],
        loadPage: 1,
        more: false
    },
    watch: {
        inputChange: debounce(async function() {
            this.results = [];
            this.loadPage = 1;
            this.more = false;
            if (!this.videoId) return this.info = "Format URL salah";
            if (this.keyword) {
                if (this.keyword.length >= 3) {
                    await this.load();
                } else {
                    this.info = "Kata kunci minimal 3 karakter"
                }
            } else {
                this.info = "Masukkan kata kunci yang ingin dicari";
            }
        }, 400)
    },
    computed: {
        inputChange: function() {
            return [this.url, this.keyword];
        },
        videoId: function() {
            if (this.url === "") return false;
            let url = this.url.search(/^https?:\/\//) !== -1 ? this.url : `http://${this.url}`;
            let params = new URL(url).searchParams;
            if (!params.has("v")) return false;
            return params.get("v");
        }
    },
    methods: {
        async load() {
            this.info = "...";
            const videoUrl = encodeURIComponent("https://www.youtube.com/watch?v=" + this.videoId);
            const respond = await fetch(
                `https://cari-teks-video-api.vercel.app/api/search?q=${this.keyword}&url=${videoUrl}&page=${this.loadPage}&size=${this.size}`
            ).then((res) => (res.ok ? res.json() : []));

            const total = respond.total;
            if (total > 0) {
                this.info = `Menampilkan ${Math.min(this.loadPage * this.size, total)} dari ${total} hasil ditemukan`;
                this.results = this.results.concat(respond.data);
                this.loadPage++;
                this.more = !!respond.next;
            } else {
                this.info = `Tidak menemukan hasil dengan kata kunci "${this.keyword}"`;
            }
        },
        formatTime(seconds) {
            const milliseconds = seconds * 1000;
            let result = new Date(milliseconds).toISOString().substr(11, 8);
            if (result.startsWith("00")) {
                result = result.substr(3);
            }
            return result.startsWith("0") ? result.substr(1) : result;
        }
    }
})

function debounce(fn, wait) {
    let timer;
    let resolveList = [];
    return function(...arguments_) {
        return new Promise(resolve => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = null;
                const result = fn.apply(this, arguments_);
                for (resolve of resolveList) {
                    resolve(result);
                }
                resolveList = [];
            }, wait);
            resolveList.push(resolve);
        });
    }
}