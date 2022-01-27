/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

BEGIN;
INSERT INTO "User" (uid, paid)
VALUES (1, true);
END;

--

BEGIN;
INSERT INTO "Map" (title, description)
VALUES ('main', 'main project');
END;

--

BEGIN;
INSERT INTO "User_Map" (user_id, map_id, status)
VALUES ( (SELECT uid FROM "User" LIMIT 1), (SELECT id FROM "Map" LIMIT 1), 'owner' );
END;
