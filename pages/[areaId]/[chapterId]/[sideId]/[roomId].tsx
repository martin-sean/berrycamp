import {Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Container, Dialog, Divider, Link as MuiLink, Theme, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {AspectBox} from "common/aspectBox/AspectBox";
import {DATA} from "logic/data/data";
import {Area, Chapter, Checkpoint, Room, Side} from "logic/data/dataTree";
import {getScreenURL} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {CampHead} from "modules/head/CampHead";
import {GetStaticPaths, GetStaticProps} from "next";
import Image from "next/image";
import Link from "next/link";
import {NextRouter, useRouter} from "next/router";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {Fragment, useEffect, useState} from "react";

const RoomPage: CampPage<RoomProps> = ({
  area,
  chapter,
  sideName,
  checkpointName,
  room,
  nextRoom,
  prevRoom,
  nextSubroom,
  prevSubroom,
}) => {
  const {settings} = useCampContext();

  const router: NextRouter = useRouter();

  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = async (): Promise<void> => {
    try {
      const port: number = settings.port ?? 32270;
      const baseUrl: string = `http://localhost:${port}`;

      await fetch(`${baseUrl}/tp${room.teleportParams}`, {mode: "no-cors"});
      await fetch(`${baseUrl}/focus`);
    } catch (e) {
      // Do nothing.
    }
  }

  /**
   * Listen for left and right presses to navigate rooms.
   */
  useEffect(() => {
    const listener = (event: WindowEventMap["keydown"]) => {
      if (event.key === "ArrowLeft" && prevRoom?.link) {
        router.push(prevRoom.link);
      } else if (event.key === "ArrowRight" && nextRoom?.link) {
        router.push(nextRoom.link);
      }
    }

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [nextRoom?.link, prevRoom?.link, router])

  const isASide: boolean = sideName === "A";

  return (
    <Fragment>
      <CampHead
        title={`${room.name} (${room.debugId})`}
        description={`${area.name} - ${chapter.name} - ${sideName} side - ${checkpointName}`}
        image={room.image}
      />
      <Container maxWidth="md">
        <Breadcrumbs separator="›" sx={{marginTop: 2}}>
          <Link passHref href={area.link}>
            <MuiLink underline="always">
              {area.name}
            </MuiLink>
          </Link>
          <Link passHref href={chapter.link}>
            <MuiLink underline="always">
              {chapter.name}
            </MuiLink>
          </Link>
          <Typography color="text.secondary">{sideName}</Typography>
          <Typography color="text.secondary">{checkpointName}</Typography>
          <Typography color="text.primary">{room.name} ({room.debugId})</Typography>
        </Breadcrumbs>
        <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)} onClick={() => setImageOpen(false)}>
          <AspectBox>
            <Image
              unoptimized
              src={getScreenURL(room.image)}
              alt={`Very large image of room ${room.name}`}
              layout="fill"
              style={{
                imageRendering: "pixelated",
              }}
            />
          </AspectBox>
        </Dialog>
        <AspectBox marginTop={2} marginBottom={2}>
          <Image
            unoptimized
            priority
            onClick={() => isUpMdWidth && setImageOpen(true)}
            src={getScreenURL(room.image)}
            alt={`Large image of room ${room.name}`}
            layout="fill"
            style={{
              imageRendering: "pixelated",
            }}
          />
        </AspectBox>
        <Box display="flex" justifyContent="space-between">
          <Typography component="div" variant="h4">{room.name}</Typography>
          <Tooltip enterDelay={750} title={isASide ? "Teleport to room if Everest is installed and running" : "May not work for B and C sides due to Everest bug"}>
            <Button
              variant="contained"
              color={isASide ? "primary" : "warning"}
              endIcon={isASide ? <Launch /> : <Info />}
              onClick={handleOpenRoom}
              aria-label="Teleports to the current room in Celeste"
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                }
              }}
            >
              Teleport
            </Button>
          </Tooltip>
        </Box>
        <Typography component="div" color="text.secondary">{chapter.name}</Typography>
        <Typography component="div" color="text.secondary">{sideName} Side</Typography>
        <Typography component="div" color="text.secondary">{checkpointName}</Typography>
        <Divider orientation="horizontal" sx={{marginTop: 1, marginBottom: 1}} />
        <Typography component="div" color="text.secondary">Debug id: {room.debugId}</Typography>
        <Typography component="div" color="text.secondary">Room id: {room.roomId}</Typography>
        <Typography component="div" color="text.secondary" sx={{marginTop: 1}}>Checkpoint room: {room.checkpointRoomNo}</Typography>
        <Typography component="div" color="text.secondary">Level room: {room.levelRoomNo}</Typography>
        <Box display="flex" gap={1} marginTop={1} marginBottom={1}>
          <Box width="100%">
            {!settings.hideSubrooms && prevSubroom?.link ? (
              <Link passHref href={prevSubroom.link}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous room ${prevSubroom.name}`}
                  sx={{width: "100%"}}
                >
                  {prevSubroom.name}
                </Button>
              </Link>
            ) : prevRoom?.link && (
              <Link passHref href={prevRoom.link}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous room ${prevRoom.name}`}
                  sx={{width: "100%"}}
                >
                  {prevRoom.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box width="100%">
            {!settings.hideSubrooms && nextSubroom?.link ? (
              <Link passHref href={nextSubroom.link}>
                <Button
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to next room ${nextSubroom.name}`}
                  sx={{width: "100%"}}
                >
                  {nextSubroom.name}
                </Button>
              </Link>
            ) : nextRoom?.link && (
              <Link passHref href={nextRoom.link}>
                <Button
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to next room ${nextRoom.name}`}
                  sx={{width: "100%"}}
                >
                  {nextRoom.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Container >
    </Fragment>
  )
}

interface NameLink {
  name: string;
  link: string;
}

export interface RoomProps {
  area: NameLink;
  chapter: NameLink;
  sideName: string;
  checkpointName: string;
  room: {
    name: string;
    image: string;
    debugId: string;
    roomId: string;
    checkpointRoomNo: string;
    levelRoomNo: string;
    teleportParams: string;
  };
  prevRoom?: NameLink;
  prevSubroom?: NameLink;
  nextRoom?: NameLink;
  nextSubroom?: NameLink;
}

interface RoomParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
  roomId: string;
}

export const getStaticPaths: GetStaticPaths<RoomParams> = async () => {
  const paths: {params: RoomParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const [chapterId, chapter] of Object.entries(area.chapters)) {
      for (const [sideId, side] of Object.entries(chapter.sides)) {
        for (const roomId of Object.keys(side.rooms)) {
          paths.push({params: {areaId, chapterId, sideId, roomId}});
        }
      }
    }
  }

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<RoomProps, RoomParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined");
  }

  const {areaId, chapterId, sideId, roomId} = params;
  const area: Area | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not valid`);
  }

  const chapter: Chapter | undefined = area.chapters[chapterId];
  if (chapter === undefined) {
    throw Error(`Chapter ${chapterId} is not valid`);
  }

  const side: Side | undefined = chapter.sides[sideId];
  if (side === undefined) {
    throw Error("Side not defined");
  }

  const room: Room | undefined = side.rooms[roomId];
  if (room === undefined) {
    throw Error(`Could not find room ${roomId} in side ${side.name}`);
  }

  const checkpoint: Checkpoint | undefined = side.checkpoints[room.checkpointNo];
  if (checkpoint === undefined) {
    throw Error(`Could not find checkpoint ${room.checkpointNo} in side ${side.name}`);
  }

  const roomIndex: number = checkpoint.roomOrder.findIndex(id => id === roomId);

  const prevRoomId: string | undefined = checkpoint.roomOrder[roomIndex - 1] ?? side.checkpoints[room.checkpointNo - 1]?.roomOrder.slice(-1)[0];
  const nextRoomId: string | undefined = checkpoint.roomOrder[roomIndex + 1] ?? side.checkpoints[room.checkpointNo + 1]?.roomOrder[0];
  const prevRoom: Room | undefined = prevRoomId ? side.rooms[prevRoomId] : undefined;
  const nextRoom: Room | undefined = nextRoomId ? side.rooms[nextRoomId] : undefined;

  const sideRoomIndex = side.checkpoints.slice(0, room.checkpointNo).reduce<number>((prev, curr) => prev + curr.roomCount, 0) + roomIndex;

  return {
    props: {
      area: {
        name: area.name,
        link: `/${areaId}`,
      },
      chapter: {
        name: chapter.name,
        link: `/${areaId}/${chapterId}`
      },
      sideName: side.name,
      checkpointName: checkpoint.name,
      room: {
        name: room.name,
        image: room.image,
        debugId: roomId,
        roomId: `${checkpoint.abbreviation}-${roomIndex + 1}`,
        levelRoomNo: `${sideRoomIndex + 1}/${side.roomCount}`,
        checkpointRoomNo: `${roomIndex + 1}/${checkpoint.roomCount}`,
        teleportParams: `?area=${area.gameId}/${chapter.gameId}&side=${sideId}&level=${roomId}${(room.x && room.y) ? `&x=${room.x}&y=${room.y}` : ""}`,
      },
      ...prevRoom && {
        prevRoom: {
          name: prevRoom.name,
          link: `/${areaId}/${chapterId}/${sideId}/${prevRoomId}`,
        }
      },
      ...nextRoom && {
        nextRoom: {
          name: nextRoom.name,
          link: `/${areaId}/${chapterId}/${sideId}/${nextRoomId}`,
        }
      },
      ...prevRoom && prevRoom.subrooms && prevRoom.subrooms.length > 0 && {
        prevSubroom: {
          name: prevRoom.subrooms.slice(-1)[0]!.name,
          link: `/${areaId}/${chapterId}/${sideId}/${prevRoomId}/${prevRoom.subrooms.length}`,
        }
      },
      ...nextRoom && nextRoom.subrooms && nextRoom.subrooms.length > 0 && {
        nextSubroom: {
          name: nextRoom.subrooms[0]!.name,
          link: `/${areaId}/${chapterId}/${sideId}/${nextRoomId}/1`,
        }
      }
    }
  }
}

export default RoomPage;