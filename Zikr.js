let Current = new Audio();
const playmusic = (track, folder) => {
    Current.src = `/surah/${folder}/` + track;
    Current.play();
    console.log(Current);
    play.src = "pause.svg";
}
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/surah/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cards")
    let array = Array.from(anchors);
    console.log(array);
    for (let index = 0; index < array.length; index++) {
        e = array[index];
        if (e.href.includes("/surah") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // console.log(folder);
            // Get the metadata of the folder
            let a = await fetch(`/surah/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
        <img class="card-image" width="130px" src="/surah/${folder}/image.jpg">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
    </div>`
        }
    }
    let data;
    let surahs = [];
    let currentFolder;
    Array.from(document.querySelector(".cards").querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async () => {
            console.log(e.dataset.folder);
            currentFolder = e.dataset.folder;
            let result = await fetch(`http://127.0.0.1:3000/surah/${currentFolder}/`);
            data = await result.text();
            d = document.createElement("div");
            d.innerHTML = data;
            let As = d.getElementsByTagName("a");
            surahs = [];
            for (let i = 0; i < As.length; i++) {
                if (As[i].href.endsWith(".mp3")) {
                    surahs.push(As[i].href.replace(`http://127.0.0.1:3000/surah/${currentFolder}/`, ""));

                }
            }
            console.log(surahs);
            let song;
            song = document.querySelector(".playlist-songs");
            song.innerHTML = `   <div class="songs">
                                <div>
                                    </div>
                                <div class="title">
                                    <div class="song-title">Audio Title</div>
                                </div>
                                <div>
                                    </div>
                            </div>`;
            for (var i = 0; i < surahs.length; i++) {
                song.innerHTML += `<div class="songs songcheck">
                                        <div>
                                            <img width="30px" src="music.svg" alt="">
                                        </div>
                                        <div class="song-info">
                                            <div class="song-title icon" >${surahs[i]}</div>
                                            </div>
                                            <div>
                                            <img width="30px" class="icon" src="play-button.svg" alt="">
                                        </div>
                                    </div>`;
            }
            console.log(surahs);
            Array.from(document.querySelector(".playlist-songs").querySelectorAll(".songs")).forEach(e => {
                e.addEventListener("click", Element => {
                    playmusic(e.querySelector(".song-title").innerHTML, currentFolder);
                    document.body.querySelector(".play-bar").firstElementChild.innerHTML = e.querySelector(".song-title").innerHTML;
                    document.body.querySelector(".play-bar").lastElementChild.innerHTML = "current/duration";
                });
            });
        });
    });
    return surahs;

    //     , {
    //     mode: 'cors',
    //     headers: {
    //         'Access-Control-Allow-Origin': '*'
    //     }
    // });
}
async function main() {
    await displayAlbums();
    //attaching eventlistener to play,previus,next
    await play.addEventListener("click", () => {
        if (play.src === "http://127.0.0.1:3000/pause.svg") {
            play.src = "http://127.0.0.1:3000/play-button.svg";
            Current.pause();
        }
        else if (play.src === "http://127.0.0.1:3000/play-button.svg") {
            play.src = "http://127.0.0.1:3000/pause.svg";
            Current.play();
        }
    });
    //volume control
    let volumeInput = document.body.querySelector(".play-bar").getElementsByTagName("div")[1].getElementsByTagName("input")[0];
    await mute.addEventListener("click", () => {
        if (mute.src === "http://127.0.0.1:3000/mute.svg") {
            mute.src = "http://127.0.0.1:3000/unmute.svg";
            Current.muted = false;
            volumeInput.value = 100;
        }
        else if (mute.src === "http://127.0.0.1:3000/unmute.svg") {
            mute.src = "http://127.0.0.1:3000/mute.svg";
            Current.muted = true;
            volumeInput.value = 0;
        }
    });
    //listen for update time changes
    function formatTime(seconds) {
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        if (secs < 10) {
            secs = '0' + secs;
        }
        if (mins < 10) {
            mins = '0' + mins;
        }
        return `${mins}:${secs}`;
    }
    //time and seekbar updates 
    Current.ontimeupdate = function () {
        let currentTime = Math.floor(Current.currentTime);
        let duration = Math.floor(Current.duration);
        document.body.querySelector(".play-bar").lastElementChild.innerHTML = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        let minLeft = 460;
        let maxLeft = 1390;
        //round ball position setting
        let newPosition = minLeft + (maxLeft - minLeft) * (Current.currentTime / Current.duration);
        document.body.querySelector(".round-ball").style.left = `${newPosition}px`;
        if (Current.currentTime === Current.duration) {
            play.src = "http://127.0.0.1:3000/play-button.svg";
        }
    };
    // listen for seek-bar change
    document.body.querySelector(".line-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.body.querySelector(".round-ball").style.left = percent + "%";
        Current.currentTime = ((Current.duration) * percent) / 100;
    })
    //adding event listener to previus button
    previus.addEventListener("click", () => {
        if (Current.currentTime > 0) {
            Current.currentTime -= 2;
        }
    })
    //for next button click
    next.addEventListener("click", () => {
        if (Current.currentTime > 0) {
            Current.currentTime += 2;
        }
    })
}
main();