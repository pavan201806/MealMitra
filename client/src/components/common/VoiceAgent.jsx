import { useState, useRef } from "react";

const VoiceAgent = () => {
  const [open, setOpen] = useState(false);

  // Size state
  const [size, setSize] = useState({
    width: 420,
    height: Math.min(window.innerHeight - 80, 720),
  });

  const resizing = useRef(false);
  const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

  // ---------------- Resize logic ----------------
  const onResizeStart = (e) => {
    e.preventDefault();
    resizing.current = true;
    resizeStart.current = {
      w: size.width,
      h: size.height,
      x: e.clientX,
      y: e.clientY,
    };
  };

  const onResizeMove = (e) => {
    if (!resizing.current) return;

    setSize({
      width: Math.max(
        360,
        resizeStart.current.w + (e.clientX - resizeStart.current.x)
      ),
      height: Math.min(
        window.innerHeight - 40,
        Math.max(
          500,
          resizeStart.current.h + (e.clientY - resizeStart.current.y)
        )
      ),
    });
  };

  const onResizeEnd = () => {
    resizing.current = false;
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button style={floatingButton} onClick={() => setOpen(true)}>
          AI
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          style={backdrop}
          onMouseMove={onResizeMove}
          onMouseUp={onResizeEnd}
        />
      )}

      {/* Centered Assistant */}
      {open && (
        <div
          style={{
            ...modal,
            width: size.width,
            height: size.height,
          }}
        >
          {/* Header */}
          <div style={header}>
            <span>Medical Voice Assistant</span>
            <button style={closeBtn} onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* Iframe */}
          <iframe
            src="http://localhost:3000"
            title="Voice Assistant"
            style={iframe}
            allow="microphone; camera; autoplay"
          />

          {/* Resize handle */}
          <div style={resizeHandle} onMouseDown={onResizeStart} />
        </div>
      )}
    </>
  );
};

export default VoiceAgent;


const floatingButton = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  background: "#0d6efd",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  zIndex: 9999,
};

const backdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(6px)",
  zIndex: 9998,
};

const modal = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  borderRadius: "18px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  zIndex: 9999,
};

const header = {
  height: "54px",
  background: "#0d6efd",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  fontSize: "14px",
};

const closeBtn = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "18px",
  cursor: "pointer",
};

const iframe = {
  flex: 1,
  border: "none",
};

const resizeHandle = {
  position: "absolute",
  width: "18px",
  height: "18px",
  bottom: "6px",
  right: "6px",
  cursor: "nwse-resize",
  background:
    "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.25) 50%)",
};
