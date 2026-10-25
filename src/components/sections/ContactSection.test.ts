// @vitest-environment node
import { describe, expect, it } from "vitest";
import { profile } from "../../data/profile";
import { messages } from "../../i18n/messages";
import { LANGUAGES } from "../../lib/language";
import { renderComponent } from "../../test/render";
import Toast from "../ui/Toast.astro";
import ContactSection from "./ContactSection.astro";

describe.each(LANGUAGES)("Contacto (%s)", (language) => {
  const t = messages[language];

  it("muestra que estás disponible, con un punto que late (decorativo)", async () => {
    const { getByText } = await renderComponent(ContactSection, { language });

    const badge = getByText(t.contact.available);
    expect(badge).toBeInTheDocument();
    const dot = badge.querySelector('[aria-hidden="true"]');
    expect(dot?.querySelector(".animate-ping")).not.toBeNull();
  });

  it("el botón de copiar lleva el correo y los mensajes del aviso", async () => {
    const { getByRole } = await renderComponent(ContactSection, { language });

    const button = getByRole("button", { name: t.contact.copyLabel });
    expect(button).toHaveAttribute("data-copy-email", profile.email);
    expect(button).toHaveAttribute("data-copied-message", t.contact.copied);
    expect(button).toHaveAttribute("data-error-message", t.contact.copyError);
  });

  it("ya no tiene su propia línea de estado: el aviso es el compartido", async () => {
    const { document } = await renderComponent(ContactSection, { language });

    expect(document.querySelector("[data-copy-status]")).toBeNull();
  });
});

describe("Toast", () => {
  it("es una región role=status con iconos decorativos para el aviso correcto y el de error", async () => {
    const { document } = await renderComponent(Toast);

    const toast = document.querySelector("[data-toast]");
    expect(toast).toHaveAttribute("role", "status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("data-tone", "ok");
    expect(toast?.querySelector("[data-toast-text]")).not.toBeNull();
    for (const svg of toast?.querySelectorAll("svg") ?? []) expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
