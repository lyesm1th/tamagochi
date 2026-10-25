# Stage 6: isolate wallet operation ID generation

Extracted the original browser crypto UUID generator into a dependency-injected
`wallet-operation-id.js` module. The app wrapper continues to pass the existing
crypto source. The native UUID path, 16-byte fallback, version 4 and RFC variant
bits, hyphen positions, error propagation and wallet operation call sites stay
identical. Tests verify both paths and the failure behavior.

No payment/gift logic, request protocol, save data, graphics or gameplay changed.
