import type { Messages } from "./types";

export const en: Messages = {
  meta: {
    title: "José Sánchez · Multiplatform application developer",
    description:
      "Portfolio of José Sánchez: Multiplatform Application Development graduate and QA Tester. Projects, experience and contact.",
    ogDescription:
      "Efficient solutions and modern digital experiences. Projects, experience and contact.",
  },
  skipToContent: "Skip to content",
  boot: { label: "Loading portfolio", skip: "Skip", skipLabel: "Skip the loading animation" },
  header: {
    homeLabel: (name) => `${name}, back to top`,
    navLabel: "Main",
    github: "GitHub (opens in a new tab)",
    linkedin: "LinkedIn (opens in a new tab)",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLanguage: { es: "Switch language to Spanish", en: "Switch language to English" },
  },
  hero: {
    eyebrowRole: (job, employer) => `${job} at ${employer}`,
    title: "I build efficient solutions and modern <h>digital experiences</h>.",
    lead: ({ role, job, employer }) =>
      `I'm a ${role}. I currently work as a <b>${job}</b> at <b>${employer}</b>, making sure applications are reliable and work as intended.`,
    viewProjects: "View projects",
    contact: "Contact me",
    profileLinksLabel: "Profile links",
    downloadCv: "Download CV",
    stackLabel: "stack",
    portraitAlt: (name) => `Photo of ${name}`,
  },
  projects: {
    techLabel: "Technologies",
    screenshotAlt: (title) => `Screenshot of the ${title} project`,
    demo: "Demo",
    code: "Code",
    viewDetail: "View details",
    closeDetail: "Close details",
    problem: "Problem",
    solution: "Solution",
    decisions: "Technical decisions",
    results: "Results",
    moreTitle: "More projects on the way",
    moreDescription:
      "I keep adding new work over time. In the meantime, you can browse my code on GitHub.",
    moreButton: "View GitHub",
  },
  experience: { work: "Experience", education: "Education", certification: "Certification" },
  about: {
    intro: ({ fullName, nickname }) =>
      `My name is ${fullName}, though my friends call me ${nickname}. I started programming at 16.`,
    current: ({ job, employer }) =>
      `I'm currently a ${job} at ${employer}, ensuring the quality and proper functioning of applications.`,
  },
  contact: {
    intro:
      "Have a project, an offer, or just want to say hi? Write to me and I'll get back to you as soon as I can.",
    copyLabel: "Copy email address",
    copied: "Email copied to the clipboard.",
    copyError: "Couldn't copy. Please select the email manually.",
    sendEmail: "Send email",
  },
  footer: {
    label: "Page footer",
    errors: (count) => `${count} ${count === 1 ? "error" : "errors"}`,
    testedTimes: (count) => `Tested ${count} times`,
    available: "Available",
    debug: "Debug",
    notFound: "404",
    notFoundLabel: "Show the 404 error page",
    console: "Ctrl+K",
    consoleLabel: "Open the interactive console (Ctrl+K)",
    comingSoon: "Coming soon",
  },
};
