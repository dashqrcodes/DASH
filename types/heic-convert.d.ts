declare module "heic-convert" {
  type HeicConvertOptions = {
    buffer: Uint8Array | Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  const heicConvert: (options: HeicConvertOptions) => Promise<Uint8Array | Buffer>;
  export default heicConvert;
}
