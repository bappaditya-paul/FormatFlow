# FormatFlow — Transformation Engine

The transformation engine is built on top of **libvips** and its Python binding **pyvips**. 

## Processing Pipeline

For each image transformation request, the engine follows this exact pipeline sequentially:

1. **Input Validation**: Check input dimensions, mime-type, and file header signatures.
2. **Metadata Reading**: Parse source image metadata (EXIF tags, orientation, size, colorspace).
3. **Auto-Orientation**: Automatically rotate the image based on EXIF orientation headers.
4. **Target Calculation**: Compute exact output width/height based on custom parameters or the selected preset.
5. **Resize/Scale**: Perform high-quality scaling using Lancaster/bicubic interpolation filters.
6. **Crop/Fit Cover/Contain**:
   - `cover`: Crop to target aspect ratio using focal point/center.
   - `contain`: Fit within boundaries, adding a background color margin if aspects mismatch.
   - `crop`: Exact crop at specified coordinates.
   - `fit`: Scale to fit within target bounding box while maintaining aspect ratio (without padding).
7. **Format Conversion**: Convert color channels and pixel formats to output targets (`jpeg`, `png`, `webp`, `avif`).
8. **Compression & Optimization**: Apply output parameters such as quality, chroma subsampling, and metadata stripping.
9. **Buffer Output**: Return output image bytes.
