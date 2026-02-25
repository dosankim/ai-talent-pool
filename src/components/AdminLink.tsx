"use client";

import { useState } from "react";

export function AdminLink() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{ position: "fixed", bottom: "10px", right: "10px", zIndex: 100 }}>
            <a
                href="/admin"
                style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    backgroundColor: "var(--surface)",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    textDecoration: "none",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                    opacity: isHovered ? 1 : 0.5,
                    transition: "opacity 0.2s"
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                admin
            </a>
        </div>
    );
}
