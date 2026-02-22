

const footerLinks = {
    Docs: [
        { label: "Get Started", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "GitHub", href: "#", external: true },
    ],
    CodeArena: [
        { label: "Demo", href: "#try-it" },
        { label: "Features", href: "#features" },
        { label: "Early Access", href: "#early-access" },
    ],
    Platform: [
        { label: "Home", href: "#", disabled: true },
        { label: "Problem Set", href: "#", disabled: true },
        { label: "Contests", href: "#", disabled: true },
    ],
    Community: [
        { label: "Our Team", href: "#" },
        { label: "Contact", href: "mailto:hello@codearena.dev" },
    ],
};

export default function HomepageFooter() {
    return (
        <footer id="footer">

            <section className="max-w-screen-xl mx-auto py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8 px-6">
                <div className="col-span-full xl:col-span-2 flex justify-center">
                    <a href="#" className="flex items-center">
                        <img src="/code-arena_logo.png" alt="CodeArena" className="h-16 w-auto" />
                    </a>
                </div>

                {Object.entries(footerLinks).map(([title, links]) => (
                    <div key={title} className="flex flex-col gap-2 items-center">
                        <h3 className="font-bold text-lg">{title}</h3>
                        {links.map((link) => (
                            <div key={link.label}>
                                {link.disabled ? (
                                    <span className="opacity-40 cursor-not-allowed">{link.label}</span>
                                ) : (
                                    <a
                                        href={link.href}
                                        className="opacity-60 hover:opacity-100 transition-opacity"
                                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    >
                                        {link.label}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </section>

            <section className="max-w-screen-xl mx-auto pb-14 text-center px-6">
                <h3>
                    &copy; 2026{" "}
                    <a href="#" className="text-osu transition-all hover:border-b-2 border-osu">
                        CodeArena
                    </a>
                </h3>
            </section>
        </footer>
    );
}
