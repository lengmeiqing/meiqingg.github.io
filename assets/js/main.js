(() => {
  const GITHUB_USERNAME = "meiqingg";
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (_) { /* Storage can be disabled. */ }
    }
  };
  const state = {
    language: storage.get("site-language") || (navigator.language.startsWith("zh") ? "zh" : "en"),
    theme: storage.get("site-theme") || "system",
    repos: []
  };

  const translations = window.SITE_TRANSLATIONS;
  const root = document.documentElement;
  const languageToggle = document.getElementById("language-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const projectGrid = document.getElementById("project-grid");

  function t(key) {
    return translations[state.language]?.[key] ?? translations.zh[key] ?? key;
  }

  function applyLanguage() {
    root.lang = state.language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      element.textContent = t(key);
    });
    languageToggle.textContent = state.language === "zh" ? "EN" : "中";
    languageToggle.setAttribute("aria-label", state.language === "zh" ? "Switch to English" : "切换到中文");
    renderProjects(state.repos);
  }

  function resolvedTheme() {
    if (state.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return state.theme;
  }

  function applyTheme() {
    root.dataset.theme = resolvedTheme();
    themeToggle.setAttribute("aria-label", resolvedTheme() === "dark" ? "切换到浅色主题" : "切换到深色主题");
  }

  function toggleTheme() {
    state.theme = resolvedTheme() === "dark" ? "light" : "dark";
    storage.set("site-theme", state.theme);
    applyTheme();
  }

  function escapeHtml(value = "") {
    return value.replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    }[character]));
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    const locale = state.language === "zh" ? "zh-CN" : "en-US";
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short" }).format(new Date(isoDate));
  }

  function renderProjects(repos, mode = "normal") {
    if (!projectGrid) return;

    if (mode === "error") {
      projectGrid.innerHTML = `
        <article class="project-card project-placeholder reveal is-visible">
          <div class="project-topline"><span class="project-kind">GitHub</span><span>↗</span></div>
          <h3>${escapeHtml(t("projects.errorTitle"))}</h3>
          <p>${escapeHtml(t("projects.errorText"))}</p>
          <a class="project-link" href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </article>`;
      return;
    }

    if (!repos.length) {
      projectGrid.innerHTML = `
        <article class="project-card project-placeholder reveal is-visible">
          <div class="project-topline"><span class="project-kind">GitHub</span><span>↗</span></div>
          <h3>${escapeHtml(t("projects.emptyTitle"))}</h3>
          <p>${escapeHtml(t("projects.emptyText"))}</p>
          <a class="project-link" href="https://github.com/${GITHUB_USERNAME}?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </article>`;
      return;
    }

    projectGrid.innerHTML = repos.slice(0, 6).map((repo) => {
      const description = repo.description || (state.language === "zh" ? "查看项目详情与源代码。" : "View project details and source code.");
      const language = repo.language || (state.language === "zh" ? "项目" : "Project");
      return `
        <article class="project-card reveal is-visible">
          <div class="project-topline">
            <span class="project-kind">${escapeHtml(language)}</span>
            <span aria-hidden="true">↗</span>
          </div>
          <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h3>
          <p>${escapeHtml(description)}</p>
          <div class="project-meta">
            <span>★ ${repo.stargazers_count} ${escapeHtml(t("projects.stars"))}</span>
            <span>${escapeHtml(t("projects.updated"))} ${formatDate(repo.updated_at)}</span>
          </div>
        </article>`;
    }).join("");
  }

  async function loadGitHubData() {
    const headers = { Accept: "application/vnd.github+json" };
    try {
      const [profileResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`, { headers })
      ]);

      if (!profileResponse.ok || !reposResponse.ok) throw new Error("GitHub API unavailable");

      const profile = await profileResponse.json();
      const repos = await reposResponse.json();
      state.repos = repos.filter((repo) => !repo.fork && !repo.archived);

      document.getElementById("repo-count").textContent = profile.public_repos ?? state.repos.length;
      document.getElementById("follower-count").textContent = profile.followers ?? 0;
      document.getElementById("github-status").textContent = "Live";
      renderProjects(state.repos);
    } catch (error) {
      document.getElementById("repo-count").textContent = "0";
      document.getElementById("follower-count").textContent = "—";
      document.getElementById("github-status").textContent = "GitHub";
      renderProjects([], "error");
    }
  }

  function setupNavigation() {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
  }

  languageToggle.addEventListener("click", () => {
    state.language = state.language === "zh" ? "en" : "zh";
    storage.set("site-language", state.language);
    applyLanguage();
  });

  themeToggle.addEventListener("click", toggleTheme);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (state.theme === "system") applyTheme();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  applyTheme();
  applyLanguage();
  setupNavigation();
  setupReveal();
  loadGitHubData();
})();
