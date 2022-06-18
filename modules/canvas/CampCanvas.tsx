import {Menu, MenuItem, Theme, useTheme} from "@mui/material";
import {FC, memo, MouseEvent, useCallback, useEffect, useRef, useState} from "react";
import AutoSizer, {Size} from "react-virtualized-auto-sizer";
import {Point, useExtentCanvas, View} from "~/modules/canvas/useExtentCanvas";
import {BoundingBox} from "~/modules/data/dataTypes";
import {CampCanvasProps} from "./types";

export const CampCanvas: FC<CampCanvasProps> = memo(({rooms, boundingBox, url}) => {
  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<Size>();
  const [imgs, setImgs] = useState<{img: CanvasImageSource, position: Point}[]>([]);

  const [contextMenu, setContextMenu] = useState<{mouseX: number, mouseY: number} | null>(null);

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setContextMenu(contextMenu === null ? {mouseX: event.clientX, mouseY: event.clientY} : null);
  }

  const handleContextMenuClose = () => {
    setContextMenu(null);
  }

  const handleCopyViewLink = () => {
    handleContextMenuClose();
    const {left, right, top, bottom} = boundingBox;
    navigator.clipboard.writeText(url + `&left=${left}&right=${right}&top=${top}&bottom=${bottom}`);
  }

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (canvasRef.current === null) {
      return;
    }

    imgs.forEach(({img, position: {x, y}}) => context.drawImage(img, x, y));
  }, [imgs]);

  /**
   * Load the room images.
   */
  useEffect(() => {
    setImgs([]);
    rooms.forEach(({image, position}) => {
      const img = new Image();
      img.src = image;
      img.onload = () => setImgs(prev => [...prev, {img, position}]);
    });
  }, [rooms]);

  const {redraw, setView} = useExtentCanvas({
    canvasRef,
    ...size && {view: calculateView(size, boundingBox)},
    onDraw: handleDraw,
  });

  /**
   * Update the size on resize.
   * 
   * @param size The new size.
   */
  const handleResize = (size: Size) => {
    setSize(size);
    redraw();
  };

  /**
   * Redraw on resize;
   */
  useEffect(() => {
    if (size === undefined) {
      return;
    }

    setView(calculateView(size, boundingBox));
    redraw();
  }, [boundingBox, redraw, setView, size]);

  return (
    <>
      <AutoSizer style={{width: "100%",  height: "100%"}} onResize={handleResize} defaultWidth={320} defaultHeight={180}>
        {({width, height}) => (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onContextMenu={handleContextMenu}
            style={{
              background,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              touchAction: "none",
            }}
          />
        )}
      </AutoSizer>
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        {...contextMenu !== null && {anchorPosition: {top: contextMenu.mouseY, left: contextMenu.mouseX}}}
      >
        <MenuItem onClick={handleCopyViewLink}>Copy View Link</MenuItem>
      </Menu>
    </>
  );
});

const calculateView = ({width, height}: Size, {top, bottom, left, right}: BoundingBox): View => {
  const scale = Math.min(height / (bottom - top - 4), width / (right - left));
  const x = -((left + ((right - left) / 2)) - (width / (2 * scale)));
  const y = -((top + ((bottom - top - 4) / 2)) - (height / (2 * scale)));
  return {scale, offset: {x, y}};
}