/**
 * Catalog: place MP3s under assets/audio/<album-folder>/ to match `file` paths.
 * Album ZIP downloads use JSZip (loaded from CDN in index.html).
 */
const albums = [
  {
    id: "a1",
    title: "Life in Open G",
    artwork: "assets/art/album-1.jpg",
    tracks: [
      {
        title: "Why'd Ya Start the Fire?",
        file: "assets/audio/album1/whyd-ya-start-the-fire-v2.mp3",
      },
      {
        title: "First World State of Mind",
        file: "assets/audio/album1/first-world-state-of-mind-v2.mp3",
      },
      { title: "Holding You", file: "assets/audio/album1/holding-you-v2.mp3" },
      {
        title: "Show You What It's Like",
        file: "assets/audio/album1/show-you-what-its-like-v2.mp3",
      },
      {
        title: "Social Media Post",
        file: "assets/audio/album1/social-media-post-v2.mp3",
      },
      {
        title: "Poet with a Tune",
        file: "assets/audio/album1/poet-with-a-tune-v2.mp3",
      },
      { title: "Bottom Line", file: "assets/audio/album1/bottom-line-v2.mp3" },
      {
        title: "Don't Feel Much Like Dancing",
        file: "assets/audio/album1/dont-feel-much-like-dancin-v2.mp3",
      },
      { title: "No Regrets", file: "assets/audio/album1/no-regrets-v2.mp3" },
      {
        title: "Good as Bad News Gets",
        file: "assets/audio/album1/good-as-bad-news-gets-v2.mp3",
      },
      {
        title: "Smoke and Mirrors",
        file: "assets/audio/album1/smoke-and-mirrors-v2.mp3",
        cowrite: "Co-write with Mike Vilenski",
      },
      { title: "Lifeline", file: "assets/audio/album1/lifeline-v2.mp3" },
      {
        title: "Familiar Tune",
        file: "assets/audio/album1/familiar-tune-v2.mp3",
      },
    ],
  },
  {
    id: "a2",
    title: "It's Not Magic, It's Dex",
    artwork: "assets/art/its-not-magic.png",
    tracks: [
      {
        title: "Just Another Morning",
        file: "assets/audio/album2/just-another-morning.mp3",
      },
      { title: "Blues Man", file: "assets/audio/album2/blues-man.mp3" },
      { title: "Simpler Times", file: "assets/audio/album2/simpler-times.mp3" },
      {
        title: "Supply Chain Blues",
        file: "assets/audio/album2/supply-chain-blues.mp3",
      },
      {
        title: "Living Memories",
        file: "assets/audio/album2/living-memories.mp3",
      },
      {
        title: "Every Now and Then",
        file: "assets/audio/album2/every-now-and-then.mp3",
      },
      { title: "Long Way Up", file: "assets/audio/album2/long-way-up.mp3" },
      {
        title: "How Good It Can Be",
        file: "assets/audio/album2/how-good-it-can-be.mp3",
      },
      {
        title: "Maybe You'll See the Light",
        file: "assets/audio/album2/maybe-youll-see-the-light.mp3",
      },
      {
        title: "Carolina in My Mind",
        file: "assets/audio/album2/carolina-in-my-mind.mp3",
      },
    ],
  },
  {
    id: "a3",
    title: "Reliving the Dream",
    artwork: "assets/art/reliving-the-dream.png",
    tracks: [
      { title: "On Her Mind", file: "assets/audio/album3/on-her-mind-v1.mp3" },
      { title: "Bit Unusual", file: "assets/audio/album3/bit-unusual-v1.mp3" },
      {
        title: "Follow Your Heart",
        file: "assets/audio/album3/follow-your-heart-v1.mp3",
      },
      {
        title: "Hallmark Fairytale",
        file: "assets/audio/album3/hallmark-fairytale-v1.mp3",
      },
      {
        title: "3 Guys at a Bar",
        file: "assets/audio/album3/3-guys-at-a-bar-v1.mp3",
      },
      { title: "Survive", file: "assets/audio/album3/survive-v1.mp3" },
      {
        title: "That's the Shape I'm In",
        file: "assets/audio/album3/shape-im-in-v1.mp3",
        cowrite: "Co-write with Brian Scott",
      },
    ],
  },
];

const audio = document.getElementById("audio");
const albumTabs = document.getElementById("album-tabs");
const trackList = document.getElementById("track-list");
const btnDownloadAlbum = document.getElementById("btn-download-album");
const btnDownloadAll = document.getElementById("btn-download-all");
const downloadStatus = document.getElementById("download-status");
const btnPlay = document.getElementById("btn-play");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const playerArt = document.getElementById("player-art");
const playerTitle = document.getElementById("player-title");
const playerAlbum = document.getElementById("player-album");
const seek = document.getElementById("seek");
const timeCurrent = document.getElementById("time-current");
const timeDuration = document.getElementById("time-duration");
const playIcon = btnPlay.querySelector(".play-icon");
const pauseIcon = btnPlay.querySelector(".pause-icon");
const playLabelEl = document.getElementById("btn-play-label");

let selectedAlbumIndex = 0;
/** @type {{ albumIndex: number, trackIndex: number } | null} */
let nowPlaying = null;
let seekDragging = false;

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getAlbum(i) {
  return albums[i];
}

function setPlayingUI(playing) {
  if (playing) {
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
    btnPlay.setAttribute("aria-label", "Pause");
    if (playLabelEl) playLabelEl.textContent = "Pause";
  } else {
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
    btnPlay.setAttribute("aria-label", "Play");
    if (playLabelEl) playLabelEl.textContent = "Play";
  }
}

function updatePlayerChrome() {
  if (!nowPlaying) {
    playerTitle.textContent = "—";
    playerAlbum.textContent = "";
    playerArt.src = "assets/art/idle.svg";
    playerArt.alt = "";
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }
  const album = getAlbum(nowPlaying.albumIndex);
  const track = album.tracks[nowPlaying.trackIndex];
  playerTitle.textContent = track.title;
  playerAlbum.textContent = album.title;
  playerArt.src = album.artwork;
  playerArt.alt = `${album.title} cover`;
  btnPrev.disabled = false;
  btnNext.disabled = false;
}

function updateDownloadAlbumButton() {
  if (!btnDownloadAlbum) return;
  const album = getAlbum(selectedAlbumIndex);
  const label = `Download “${album.title}” as ZIP`;
  btnDownloadAlbum.textContent = `Download “${album.title}”`;
  btnDownloadAlbum.setAttribute("aria-label", label);
}

function announceStatus(message) {
  downloadStatus.textContent = message;
  if (message) {
    window.setTimeout(() => {
      downloadStatus.textContent = "";
    }, 5000);
  }
}

function safeZipSegment(name) {
  const s = name
    .replace(/[/\\?*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return s || "album";
}

function safeZipFilename(name) {
  return `${safeZipSegment(name)}.zip`;
}

function basename(path) {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}

/** @param {string} url */
async function fetchAsBlob(url) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Could not fetch ${basename(url)} (${res.status})`);
  return res.blob();
}

function triggerBlobDownload(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

/** @param {typeof albums[0]} album */
async function addAlbumToZip(zip, album) {
  const folder = safeZipSegment(album.title);
  for (const track of album.tracks) {
    const name = basename(track.file);
    const blob = await fetchAsBlob(track.file);
    zip.file(`${folder}/${name}`, blob);
  }
}

async function runZipDownload(buildFn, filename, busyLabel) {
  const JSZipGlobal = typeof window !== "undefined" ? window.JSZip : undefined;
  if (!JSZipGlobal) {
    announceStatus(
      "ZIP library failed to load. Check your connection and reload.",
    );
    return;
  }

  const hasDlButtons = btnDownloadAlbum && btnDownloadAll;
  if (hasDlButtons) {
    btnDownloadAlbum.disabled = true;
    btnDownloadAll.disabled = true;
    btnDownloadAlbum.textContent = busyLabel;
    btnDownloadAll.textContent = busyLabel;
  }
  announceStatus("");

  try {
    const zip = new JSZipGlobal();
    await buildFn(zip);
    const blob = await zip.generateAsync({ type: "blob" });
    triggerBlobDownload(blob, filename);
    announceStatus(`Saved ${filename}.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Download failed.";
    announceStatus(msg);
  } finally {
    if (hasDlButtons) {
      btnDownloadAlbum.disabled = false;
      btnDownloadAll.disabled = false;
      updateDownloadAlbumButton();
      btnDownloadAll.textContent = "Download everything";
      btnDownloadAll.setAttribute(
        "aria-label",
        "Download all albums as a single ZIP file",
      );
    }
  }
}

function renderTrackRows() {
  const album = getAlbum(selectedAlbumIndex);
  trackList.innerHTML = "";
  album.tracks.forEach((track, trackIndex) => {
    const li = document.createElement("li");
    li.className = "track-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "track-row";
    btn.dataset.albumIndex = String(selectedAlbumIndex);
    btn.dataset.trackIndex = String(trackIndex);

    const isCurrent =
      nowPlaying &&
      nowPlaying.albumIndex === selectedAlbumIndex &&
      nowPlaying.trackIndex === trackIndex;
    if (isCurrent) btn.setAttribute("aria-current", "true");

    const cowriteHtml = track.cowrite
      ? `<span class="track-cowrite">${escapeHtml(track.cowrite)}</span>`
      : "";
    btn.innerHTML = `
      <span class="track-num">${trackIndex + 1}</span>
      <span class="track-main">
        <span class="track-title">${escapeHtml(track.title)}</span>
        ${cowriteHtml}
      </span>
    `;
    btn.addEventListener("click", () =>
      playTrack(selectedAlbumIndex, trackIndex),
    );
    btn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        playTrack(selectedAlbumIndex, trackIndex);
      }
    });

    li.appendChild(btn);
    trackList.appendChild(li);
  });
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderTabs() {
  albumTabs.innerHTML = "";
  albums.forEach((album, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tab";
    tab.role = "tab";
    tab.id = `tab-${album.id}`;
    tab.setAttribute("aria-controls", "track-panel");
    tab.setAttribute(
      "aria-selected",
      index === selectedAlbumIndex ? "true" : "false",
    );
    tab.tabIndex = index === selectedAlbumIndex ? 0 : -1;
    tab.setAttribute("aria-label", album.title);

    const cover = document.createElement("img");
    cover.className = "tab__cover";
    cover.src = album.artwork;
    cover.alt = "";
    cover.width = 80;
    cover.height = 80;
    cover.decoding = "async";

    const title = document.createElement("span");
    title.className = "tab__title";
    title.textContent = album.title;
    title.setAttribute("aria-hidden", "true");

    tab.appendChild(cover);
    tab.appendChild(title);

    tab.addEventListener("click", () => selectAlbum(index));
    tab.addEventListener("keydown", (e) => onTabKeydown(e, index));
    albumTabs.appendChild(tab);
  });
}

function onTabKeydown(e, index) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(e.key)) return;
  e.preventDefault();
  let next = index;
  if (e.key === "ArrowRight") next = Math.min(albums.length - 1, index + 1);
  if (e.key === "ArrowLeft") next = Math.max(0, index - 1);
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = albums.length - 1;
  selectAlbum(next);
  const tabs = albumTabs.querySelectorAll('[role="tab"]');
  tabs[next]?.focus();
}

function selectAlbum(index) {
  selectedAlbumIndex = index;
  albumTabs.querySelectorAll('[role="tab"]').forEach((tab, i) => {
    tab.setAttribute("aria-selected", i === index ? "true" : "false");
    tab.tabIndex = i === index ? 0 : -1;
  });
  updateDownloadAlbumButton();
  renderTrackRows();
}

function playTrack(albumIndex, trackIndex) {
  const album = getAlbum(albumIndex);
  const track = album.tracks[trackIndex];
  if (!track) return;

  nowPlaying = { albumIndex, trackIndex };
  audio.src = track.file;
  updatePlayerChrome();
  renderTrackRows();

  audio.play().catch(() => setPlayingUI(false));
}

/** Next / previous wrap inside the current album only. */
function playRelative(delta) {
  if (!nowPlaying) return;
  const { albumIndex, trackIndex } = nowPlaying;
  const tracks = getAlbum(albumIndex).tracks;
  let next = trackIndex + delta;
  if (next < 0) next = tracks.length - 1;
  if (next >= tracks.length) next = 0;
  playTrack(albumIndex, next);
}

function syncSeekFromAudio() {
  if (seekDragging) return;
  const d = audio.duration;
  const t = audio.currentTime;
  if (Number.isFinite(d) && d > 0) {
    seek.value = String(Math.round((t / d) * 1000));
    timeDuration.textContent = formatTime(d);
  } else {
    seek.value = "0";
    timeDuration.textContent = "0:00";
  }
  timeCurrent.textContent = formatTime(t);
}

btnDownloadAlbum?.addEventListener("click", () => {
  const album = getAlbum(selectedAlbumIndex);
  const fn = safeZipFilename(album.title);
  runZipDownload((zip) => addAlbumToZip(zip, album), fn, "Zipping…");
});

btnDownloadAll?.addEventListener("click", () => {
  runZipDownload(
    async (zip) => {
      for (const album of albums) {
        await addAlbumToZip(zip, album);
      }
    },
    "all-albums.zip",
    "Zipping…",
  );
});

audio.addEventListener("play", () => setPlayingUI(true));
audio.addEventListener("pause", () => setPlayingUI(false));
audio.addEventListener("ended", () => playRelative(1));
audio.addEventListener("timeupdate", syncSeekFromAudio);
audio.addEventListener("loadedmetadata", syncSeekFromAudio);

btnPlay.addEventListener("click", () => {
  const album = getAlbum(selectedAlbumIndex);
  const first = album?.tracks[0];
  const needsAlbumStart =
    !nowPlaying ||
    nowPlaying.albumIndex !== selectedAlbumIndex ||
    !album?.tracks[nowPlaying.trackIndex];
  if (needsAlbumStart) {
    if (first) playTrack(selectedAlbumIndex, 0);
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});

btnPrev.addEventListener("click", () => playRelative(-1));
btnNext.addEventListener("click", () => playRelative(1));

seek.addEventListener("input", () => {
  seekDragging = true;
  const d = audio.duration;
  if (Number.isFinite(d) && d > 0) {
    const t = (Number(seek.value) / 1000) * d;
    timeCurrent.textContent = formatTime(t);
  }
});

seek.addEventListener("change", () => {
  const d = audio.duration;
  if (Number.isFinite(d) && d > 0) {
    audio.currentTime = (Number(seek.value) / 1000) * d;
  }
  seekDragging = false;
});

renderTabs();
updateDownloadAlbumButton();
renderTrackRows();
updatePlayerChrome();
setPlayingUI(false);
