--
-- PostgreSQL database dump
--

\restrict edMzihSk1irhjpSc132E0YJv2gVSYzTA6PPK50GO9wZJLNRNWKDn54ddqrxYeYZ

-- Dumped from database version 17.10 (21f7c76)
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Admin" DISABLE TRIGGER ALL;

COPY public."Admin" (id, username, password, "createdAt") FROM stdin;
cmpv6s6fp0000fbrmnr36izwf	bocilwindut	fbd7772c36581ba134b60a8aac07525b2fce57b40ad504286805485f9bbf823a	2026-06-01 12:30:12.373
\.


ALTER TABLE public."Admin" ENABLE TRIGGER ALL;

--
-- Data for Name: BotHeartbeat; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."BotHeartbeat" DISABLE TRIGGER ALL;

COPY public."BotHeartbeat" (id, instance, "botTypeSlug", "lastSeen", "updatedAt") FROM stdin;
instance_1_kimi-store	1	kimi-store	2026-06-18 04:02:46.109	2026-06-18 04:02:46.109
instance_2_kimmy	2	kimmy	2026-06-18 04:03:22.584	2026-06-18 04:03:22.585
instance_1_kimmy	1	kimmy	2026-06-15 15:19:30.447	2026-06-15 15:19:30.447
\.


ALTER TABLE public."BotHeartbeat" ENABLE TRIGGER ALL;

--
-- Data for Name: BotType; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."BotType" DISABLE TRIGGER ALL;

COPY public."BotType" (id, name, slug, description, features, "isActive", "maxSlots", "totalInstances", "acceptingOrders", "hasPremiumTier", "createdAt", "updatedAt") FROM stdin;
cmpv6yrr50001ov51ummvb8wu	Kimmy Bot (Jaga Group)	kimmy	Bot jaga grup WhatsApp — anti spam, games, absen, dan banyak fitur lainnya.	{"Anti Spam",Games,Absen,"Tag All",Welcome/Goodbye,"Anti Link","HDVid, RVO, UpSwGC (Premium)","Unlimited Limit (Premium)"}	t	30	2	t	t	2026-06-01 12:35:19.937	2026-06-01 13:59:14.316
cmpv6ytjh000aov51dqfklid9	Kimmy Bot Store	kimi-store	Bot store WhatsApp — auto respon, katalog produk, dan manajemen toko.	{"Katalog Produk","Fitur lebih rapih","Cocok untuk jualan/reseller","Online 24/7 Auto Respon"}	t	20	1	t	f	2026-06-01 12:35:22.253	2026-06-01 16:17:28.279
\.


ALTER TABLE public."BotType" ENABLE TRIGGER ALL;

--
-- Data for Name: Rental; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."Rental" DISABLE TRIGGER ALL;

COPY public."Rental" (id, "groupId", "groupName", "groupLink", "botTypeId", "botInstance", status, source, "isPremium", "expiresAt", "contactPhone", notes, "createdAt", "updatedAt") FROM stdin;
cmpv6ytrv000cov51zawaz5j5	120363424480791327	\N	https://chat.whatsapp.com/C29LaKr2q2kFUyoiI9xQ5R	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-05-23 02:52:50.978	\N	\N	2026-02-21 00:52:51.882	2026-06-01 12:35:22.555
cmpv6yu9h000eov517y7gp6hx	120363424569285788	\N	https://chat.whatsapp.com/LJLLy7h2cQsHjerHExK2tp	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-05-24 02:54:38.173	\N	\N	2026-02-21 00:54:39.133	2026-06-01 12:35:23.189
cmpv6yycf001aov51g1ggodol	120363407274262383	\N	https://chat.whatsapp.com/JdMwoOcoddeA0jfcJJ3Npf	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-05-20 07:29:08.134	\N	\N	2026-04-19 06:29:10.627	2026-06-01 12:35:28.48
cmpv6yylk001cov51oydscfnn	120363396211063259	\N	https://chat.whatsapp.com/GMK5uMYfBgMLEccMyE42Ql	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-05-25 03:21:32.134	\N	\N	2026-04-24 02:21:34.09	2026-06-01 12:35:28.808
cmpv735rs0003xl3scpkgjcma	120363424761266109	ThaliaaStore 🍡*♡༘˚°:֪ ׅ ֹ =͟͞ ♡ BACA DESKRIPSI	https://chat.whatsapp.com/KFnwxo38r1T76MiN6Ckth9	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-07 11:57:57.492	\N	\N	2026-06-01 12:38:44.728	2026-06-01 12:38:44.728
cmpv735rz0005xl3sv1bndlta	120363405714712309	Reseller Selaras Corp	\N	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2027-01-29 12:24:34.45	\N	\N	2026-06-01 12:38:44.736	2026-06-01 12:38:44.736
cmpv735ss000dxl3s0ynl5wm2	120363404096709997	⋆୨୧˚𝐑𝐞𝐬𝐞𝐥𝐥𝐞𝐫 𝐋𝐨𝐥𝐢𝐞𝐞˚୨୧⋆	https://chat.whatsapp.com/BG8uRtpUh71EhrqakeHgpd	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-01 12:04:36.121	\N	\N	2026-06-01 12:38:44.765	2026-06-01 12:38:44.765
cmpv735tv000pxl3s9h08q0uy	120363426473306028	grupp daftar hargaaaa	\N	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-06-19 07:33:41.269	\N	\N	2026-06-01 12:38:44.803	2026-06-01 12:38:44.803
cmpv735rg0001xl3sezqwas3b	120363424390771159	Kalllstore (reseller) (jangan chet bot) | canva 1k | AM 1k | capcut pro 1k | wdp 26k | yt 1b 2k |	\N	cmpv6ytjh000aov51dqfklid9	1	ENDED	BOT	f	2026-05-18 09:06:45.647	\N	\N	2026-06-01 12:38:44.717	2026-06-01 12:38:46.306
cmpv735sm000bxl3s698mhmz1	120363425572482281	Storebynut	\N	cmpv6ytjh000aov51dqfklid9	1	ENDED	BOT	f	2026-05-20 12:45:29.488	\N	\N	2026-06-01 12:38:44.758	2026-06-01 12:38:46.432
cmpv6yuqi000iov51ah51i3j6	120363404101317034	‧₊˚Reseller Vkeyy store .✧˚	https://chat.whatsapp.com/C2JbIyQfyC8I5rSIqXNSUd	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-17 06:58:28.409	\N	\N	2026-02-21 00:58:29.464	2026-06-17 10:57:58.893
cmpv6yxbz0014ov51yq7ym5ys	120363406081113461	\N	https://chat.whatsapp.com/E1daRBMgW0VDPkeb9WqlQd	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-06-10 17:19:33.749	\N	\N	2026-03-15 10:45:36.365	2026-06-10 17:19:34.75
cmpv735th000lxl3sy9xev9qi	120363405117455769	kwocag | sewa bot & app prem	\N	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2126-05-25 04:02:46.129	\N	\N	2026-06-01 12:38:44.79	2026-06-18 04:02:46.132
cmpv6yui2000gov51fvtrfmck	120363324329336700	𝐀𝐍𝐆𝐄𝐋'𝐒 𝐅𝐀𝐌𝐈𝐋𝐘 (𝗞𝗢𝗡𝗧𝗘𝗡)	https://chat.whatsapp.com/BPIIuvsmkjI7mR98WCwLSu	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2027-04-12 03:57:17.713	\N	\N	2026-02-21 00:57:18.832	2026-06-17 10:57:59.717
cmpv6yz34001gov518wqw29qq	120363418672824338	𒆜𝐅𝐍𝐀𝐓𝐈𝐂 𝐊𝐀𝐙𝐄 𒆜	https://chat.whatsapp.com/IVEXYFGLhXx1CeLmzJ0IzB	cmpv6yrr50001ov51ummvb8wu	2	ENDED	BOT	f	2026-06-13 10:17:36.057	\N	\N	2026-05-13 09:17:37.524	2026-06-13 10:18:34.715
cmpv6yvoc000qov51903eps5v	120363298431817828	—⁠☆𝗍𝗁౿ 𝖩ɑ𝗑'ડ 𝖬ꪱᜒ𐓣ꪱᜒ𝗈𐓣ડ🍌	https://chat.whatsapp.com/KFY3QDvdAIvGbKicDxyNVQ	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2126-05-01 13:32:55.256	\N	\N	2026-03-15 10:34:33.277	2026-06-17 10:57:59.953
cmpv735t5000hxl3s2xvdo76h	120363410019619085	RESELLER ILAA	\N	cmpv6ytjh000aov51dqfklid9	1	ENDED	BOT	f	2026-06-08 14:22:18.87	\N	\N	2026-06-01 12:38:44.777	2026-06-08 14:23:33.427
cmpv6yuyo000kov51sl8rvsqv	120363423434804264	Reseller premappsbykei	https://chat.whatsapp.com/DNNtFmbP30XFYlbgs8kALN	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-08-29 02:59:19.401	\N	\N	2026-02-21 00:59:20.589	2026-06-17 10:57:57.245
cmpv735sy000fxl3s0rkaegms	120363420424672777	𝐒𝐄𝐑𝐑𝐀 𝐒𝐓𝐎𝐑𝐄 | 𝐎𝐏𝐄𝐍 𝐑𝐄𝐒𝐒	https://chat.whatsapp.com/JfFvKRXaZ92EoNPCgfaen8	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-18 08:10:07.286	\N	\N	2026-06-01 12:38:44.771	2026-06-14 08:35:25.314
cmpv6yw53000uov51u8s4lk7m	120363421440319678	ＡＬＬ   ＭＥＭＢＥＲ	https://chat.whatsapp.com/IATcQg8J9Jo2jl5aWAIx8r	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2126-05-01 13:31:04.743	\N	\N	2026-03-15 10:35:36.447	2026-06-17 10:57:59.362
cmpv735to000nxl3s2h5bsgrh	120363428924511943	88 VINEYARDS	\N	cmpv6ytjh000aov51dqfklid9	1	ENDED	BOT	f	2026-06-09 05:56:52.471	\N	\N	2026-06-01 12:38:44.797	2026-06-17 10:57:57.564
cmpv6yv76000mov51yicy4y36	120363422525847618	💡✨𝐑𝐞𝐬𝐞𝐥𝐥𝐞𝐫 𝐁𝐥𝐨𝐨𝐦𝐢𝐢✨💡	https://chat.whatsapp.com/I3xoUPVMgfZCLZaafx6P90	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-07-19 06:00:45.867	\N	\N	2026-02-21 01:00:47.007	2026-06-17 10:57:59.478
cmpv6ywur0010ov5167sctsoi	120363403759809625	🎀˳ 🐾 S TO R E E P U T  🎀˳ 🐾	https://chat.whatsapp.com/GrFvrSWueE586naqI9lsjY	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2126-05-01 13:31:40.754	\N	\N	2026-03-15 10:44:41.713	2026-06-17 10:57:57.842
cmpv6yyuc001eov51qx5wzigr	120363423514482350	℘eople lꨄ︎ve Ꭰᥱᥕ𝗍ᥱᥱ	https://chat.whatsapp.com/BnaniwV4nS144fQOlykieb	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-27 13:22:37.295	\N	\N	2026-04-24 11:22:39.405	2026-06-17 10:57:59.589
cmpv6yvfh000oov51zr0ffiik	6289635270409-1630648925	𝐓ɦ𝖾 𝐉α𝗑ƶ𝗂𝖾ᥣᥣ'𝗌 𝐅αꭑ𝗂ᥣ𝗒🚩	https://chat.whatsapp.com/JisauORMSjHIGWTXp4BGFr	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-07-18 06:03:03.075	\N	\N	2026-02-21 01:03:03.998	2026-06-17 10:57:58.186
cmpv735sf0009xl3s9d3jb63c	120363404710826331	₍ᐢ.ˬ.ᐢ₎ ʀᴇsᴇʟʟᴇʀ ᴅɪᴠᴀᴘʀᴇᴍɪᴜᴍ.ꜱᴛᴏʀᴇ ₍ᐢ.ˬ.ᐢ₎	https://chat.whatsapp.com/GrnAr2eMCEaJu4Hp8m9NWK	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-09-05 05:23:45.148	\N	\N	2026-06-01 12:38:44.751	2026-06-04 05:53:30.301
cmpv6yy420018ov51e00sj48g	120363407439919655	\N	https://chat.whatsapp.com/JJ847ZjowfY9ZHOXrCeWUJ	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-06-02 07:56:08.533	\N	\N	2026-04-02 05:56:11.454	2026-06-02 07:56:18.818
cmpv735u1000rxl3shzyuykqv	120363408142859891	Reseller Solsthyc 🦢	https://chat.whatsapp.com/FOVjhfzgGdKB99qFYn8D9l	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-18 04:03:17.343	\N	\N	2026-06-01 12:38:44.81	2026-06-14 04:46:10.544
cmpv6yx330012ov5155s53yzw	120363426033273503	Plenger2plenger	https://chat.whatsapp.com/HcaAksVqXq7H4wRwsyQX1z	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2126-05-01 13:30:50.775	\N	\N	2026-03-15 10:45:12.422	2026-06-17 10:57:58.543
cmpv6ywdo000wov51nivvmc25	120363420768822183	𝗯𝗮𝗲𝗯𝗹𝘂 𝘀𝘁𝗼𝗿𝗲 🌀| order di grup	https://chat.whatsapp.com/EArWqi2EafPEDoDXDyl2FC	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2126-05-01 13:32:16.185	\N	\N	2026-03-15 10:43:26.706	2026-06-17 10:57:59.844
cmpv6yvwl000sov51z8dpaeqd	120363419779376702	Moment Of Always 🍀	https://chat.whatsapp.com/IcRSoXvJcmIHngKMZwxtkM	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2126-05-01 13:33:34.242	\N	\N	2026-03-15 10:35:11.064	2026-06-17 10:57:59.134
cmpv735tb000jxl3s5kr6egcn	120363407980758087	SELLER APK JUY	https://chat.whatsapp.com/Ke2Bfqhiz3MEQCgmEdefgo	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-15 03:34:00.46	\N	\N	2026-06-01 12:38:44.784	2026-06-11 06:08:03.978
cmpv6ywm0000yov51hv8fn0hz	120363404776251314	EVOCΛTIVE PHX	https://chat.whatsapp.com/F2pMtAxyzJJCbmpk48lS7A	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2126-05-07 07:25:39.315	\N	\N	2026-03-15 10:44:06.206	2026-06-17 10:57:58.667
cmpv6yxvs0016ov51j3xpn1xd	120363402140421614	CHIXXSTORE	https://chat.whatsapp.com/LbaYsG5fn6S08dsq0mVbu6	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-07-04 02:53:44.263	\N	\N	2026-04-01 23:53:46.006	2026-06-17 10:57:58.429
cmpv74kvb0015xl3s5omhskhg	120363368253160843	KNOCKING OFF 1	https://chat.whatsapp.com/IVIjlsuKD6rBtP5KMTv7Bx	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-22 17:34:09.688	\N	\N	2026-06-01 12:39:50.952	2026-06-17 10:57:58.2
cmpv74kx6001lxl3sb1dadazc	120363409381848559	GRUP ARISAN ARDEV 🔥	https://chat.whatsapp.com/GEycz1KcCKc70RSpMLlKk2	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	t	2126-05-02 11:03:27.182	\N	\N	2026-06-01 12:39:51.018	2026-06-02 07:57:45.244
cmpv73gsv000txl3sq8iunind	120363409938638999	DANA TALANG	https://chat.whatsapp.com/C4fymHwbmuWK2u5sKGBdvj	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-18 02:07:52.376	\N	\N	2026-06-01 12:38:59.023	2026-06-17 10:57:58.788
cmpv74kxw001txl3s5xgalwob	120363426386745160	keluarga brokhaven	https://chat.whatsapp.com/HDQntS7qo1Y7Xize9d2oXr	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-06-02 15:21:12.036	\N	\N	2026-06-01 12:39:51.045	2026-06-02 15:23:01.304
cmpwpo8f70001piip9n6buiqr	120363403629848534	X.4	https://chat.whatsapp.com/HXx5nlgOvHCBc7S9JsbibV	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	t	2026-07-03 15:04:16.946	\N	\N	2026-06-02 14:06:47.203	2026-06-03 03:29:31.054
cmpv73gu40013xl3s4cdcu6c1	120363406528520856	➡︎♚ SHADOW ANGEL'S♚➡︎	https://chat.whatsapp.com/ELGseLzrp5q3f31SUDAyhH	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-08-28 05:26:03.638	\N	\N	2026-06-01 12:38:59.068	2026-06-17 10:57:58.334
cmpv74kzf0029xl3s4wv3uoxj	120363424997525505	KNOCKING OFF VIP	https://chat.whatsapp.com/JXzxPvK61kGKGHhxXaKSl1	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-13 12:43:22.574	\N	\N	2026-06-01 12:39:51.099	2026-06-17 10:57:57.845
cmpv74kwx001jxl3s4knrm6wp	120363424279466719	SawasdeePick GO 🇹🇭	https://chat.whatsapp.com/GBSDZneENf76zn1b2ZH8uc	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-24 19:29:45.446	\N	\N	2026-06-01 12:39:51.01	2026-06-17 10:57:58.593
cmpviwr1a0001jot11fntyx18	120363408369453048	tes bot ulang	https://chat.whatsapp.com/EIgHUFoYa3kBhJQkRxE9M2	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2126-05-08 18:08:46.28	\N	\N	2026-06-01 18:09:41.086	2026-06-17 10:57:56.678
cmpv74kxj001pxl3snjqls6c4	120363426682665666	RESELLER || @ririsdn App Premium Store	https://chat.whatsapp.com/IoD8Be7pjTA3NfVCMgAp63	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-15 12:54:24.999	\N	\N	2026-06-01 12:39:51.031	2026-06-17 10:57:57.679
cmpv74ky2001vxl3s091iknql	120363422938532873	𝗚𝗥𝗨𝗣 𝗠𝗔𝗕𝗔𝗥 𝗠𝗟𝗕𝗕/𝗬𝗔𝗣𝗣𝗜𝗡𝗚 𝗕𝗬 𝗔𝗟𝗭 𝗫 𝗗𝗜𝗡𝗢 𝗫 𝗣𝗔𝗡	https://chat.whatsapp.com/DW0LqHCpTzzEpyAMsdCk8D	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-09-04 20:38:07.738	\N	\N	2026-06-01 12:39:51.051	2026-06-15 15:24:48.913
cmpv74kvi0017xl3s9cqp4d2r	120363400490323679	KNOCKING OFF 3	https://chat.whatsapp.com/BtIlcTLynBj6yeufuh1Kkr	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-22 16:34:35.459	\N	\N	2026-06-01 12:39:50.959	2026-06-17 10:57:57.961
cmpv74kw3001bxl3sgx2ly63z	120363316753043366	KNOCKING OFF (FAMILY)	https://chat.whatsapp.com/EqrdHrFUL8UFuAyduTM5bX	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-22 16:33:58.623	\N	\N	2026-06-01 12:39:50.979	2026-06-17 10:57:59.035
cmpv74kya001xxl3sc702gocs	120363424953792842	ANOMALI KODAM	https://chat.whatsapp.com/CYT2jA4eLWyHKwTyaMrfug	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-04 14:44:05.357	\N	\N	2026-06-01 12:39:51.058	2026-06-17 10:57:57.338
cmpv73gtj000xxl3s193f58xb	120363409135765245	STAR SYNDROME	https://chat.whatsapp.com/GPnnYNvT8443jX662j1liV	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-06-28 11:32:24.796	\N	\N	2026-06-01 12:38:59.047	2026-06-17 10:57:59.246
cmpv73gtx0011xl3smcr4vjc5	120363404523231967	EVOCΛTIVE	https://chat.whatsapp.com/Jc0TcD5hWXOCci8xZHc0NT	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-06-29 05:46:00.552	\N	\N	2026-06-01 12:38:59.061	2026-06-17 10:57:59.008
cmpv74kwq001hxl3svxva5u29	120363355093712076	𝔊𝔅 𝔉𝔦𝔱𝔯𝔞𝔥 𝔖𝔱𝔬𝔯𝔢 (𝔄𝔪 𝔓𝔯𝔢𝔪 3𝔨) 🔥 - Happy Eid Mubarak✨	https://chat.whatsapp.com/Je9l7Jj6TX77sufGIJb3ZZ	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-08-10 14:56:43.787	\N	\N	2026-06-01 12:39:51.003	2026-06-17 10:57:59.133
cmpv6yzc4001iov51n7him1fp	120363338245830669	STATISTIK KIMMY BOT📊	https://chat.whatsapp.com/BZ3a9UTmqLLKfxCsfxcWdT	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2028-07-27 07:10:13.071	\N	\N	2026-05-18 20:13:00.113	2026-06-18 04:02:55.737
cmpv74kyh001zxl3sk628bxd8	120363407597602618	KNOCKING OFF 4	https://chat.whatsapp.com/C2TBsIzlMrC5b2KZViBOx3	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-02 16:02:34.018	\N	\N	2026-06-01 12:39:51.066	2026-06-17 10:57:58.328
cmpv74kzx002bxl3s407dyg7i	120363424837252438	RESS APKPREM BY FANANDASTORE	https://chat.whatsapp.com/CH7NfAFsdoG7FFgVgVszAT	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-22 09:18:22.759	\N	\N	2026-06-01 12:39:51.117	2026-06-17 10:57:57.451
cmpv74kxd001nxl3scvr4rb8q	120363425832655711	LIVETOSKYᴺⱽᴿ	https://chat.whatsapp.com/Kfui2xOxfkqAvImNjjRi5P	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-06-04 15:46:46.588	\N	\N	2026-06-01 12:39:51.025	2026-06-04 15:47:16.686
cmpv73gtp000zxl3spojfl2fs	120363408305692618	Seleksi star syndrom	https://chat.whatsapp.com/FljRjS4ShpaK3RACKTCLHp	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-28 11:32:53.1	\N	\N	2026-06-01 12:38:59.054	2026-06-17 10:57:57.142
cmpxie9pr0001c0xshayw92og	120363424820150211	Three of us	https://chat.whatsapp.com/LOBkxiO1VCiBVWJpnBNAve	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-03 04:29:45.228	\N	\N	2026-06-03 03:30:51.183	2026-06-17 10:57:56.86
cmpv74kyv0023xl3ssosyg8c6	120363426813758994	Vico | Voca | Veca	https://chat.whatsapp.com/JqU817vysdK4yBgB75V1Rk	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	t	2026-06-05 11:21:15.163	\N	\N	2026-06-01 12:39:51.08	2026-06-05 11:22:06.282
cmpwotdpm0001el0ay15fbucm	120363427020584627	omak test order	https://chat.whatsapp.com/LesFz5VcS7jBYNmgoJnvBB	cmpv6yrr50001ov51ummvb8wu	1	ENDED	WEBSITE	f	2026-06-03 13:46:50.468	085135252485	\N	2026-06-02 13:42:47.722	2026-06-03 13:47:15.299
cmpv74l04002dxl3s6ua94mqp	120363409749385752	alamak	https://chat.whatsapp.com/JjkOKzAbPekA13EBY6ikkP	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	f	2026-06-08 05:28:04.685	\N	\N	2026-06-01 12:39:51.124	2026-06-08 05:29:22.636
cmpv74kz90027xl3sc71fqplq	120363426048232606	𝐌𝐋𝐁𝐁 𝐀𝐑𝐄𝐀	https://chat.whatsapp.com/LcYdM93wo9b9KtqH6OXiB3	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-07-09 14:04:02.397	\N	\N	2026-06-01 12:39:51.093	2026-06-17 10:57:59.238
cmpv74kyo0021xl3su2219k3t	120363405149763920	GRUP CLAIM	https://chat.whatsapp.com/GXym7nFJoUr9OIFwehFDH1	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-09-01 14:04:13.076	\N	\N	2026-06-01 12:39:51.072	2026-06-17 10:57:57.119
cmpv74kxq001rxl3ss469f76g	120363406872799340	STRONG, HONEST, EMPOWERED	https://chat.whatsapp.com/HYlVZ7ms4IwDmuyVX6L19S	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-09-18 07:50:28.19	\N	\N	2026-06-01 12:39:51.038	2026-06-17 10:57:58.821
cmpv74kwi001fxl3sohrpxfxk	120363424410639861	ROOM CHAT MEMBER AOH	https://chat.whatsapp.com/IgklMlqK6O3DyqQWPzcTDq	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-27 14:23:58.759	\N	\N	2026-06-01 12:39:50.994	2026-06-17 10:57:58.444
cmpv74kvs0019xl3suas57oem	120363385997771651	KNOCKING OFF 2	https://chat.whatsapp.com/CtWk5Tam5svCYqE4gdznsL	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-22 16:34:20.218	\N	\N	2026-06-01 12:39:50.968	2026-06-17 10:57:58.08
cmpv74kz20025xl3sgfcombk5	120363426396479453	KH ANAK BAIK><	https://chat.whatsapp.com/Fk5EGsLNMt84E5Fc6RBiax	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-08-09 12:48:11.566	\N	\N	2026-06-01 12:39:51.087	2026-06-17 10:57:57.223
cmpv73gtc000vxl3srelg63qp	120363426504854805	𝗥𝗘𝗦𝗘𝗟𝗟𝗘𝗥 𝗟𝗔𝗣𝗔𝗞𝗚𝗔𝗕𝗨𝗧 🐣	https://chat.whatsapp.com/IBvpLc1mqnn0qRHMlEWCEm	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-20 10:14:15.648	\N	\N	2026-06-01 12:38:59.04	2026-06-17 10:57:56.831
cmq0uwd9s0001nx6elksj1ow4	120363410775450459	Tes	https://chat.whatsapp.com/CJ8t9GyWm2g4n1c1FQzPgo	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-06 12:39:10.769	\N	\N	2026-06-05 11:44:09.521	2026-06-17 10:57:56.138
cmq84t6fm0001hlxm8xhei5d0	120363409629981059	Grup Hencet	https://chat.whatsapp.com/BCP0hMwYLQ0BjDwt1M2UmJ	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2026-07-11 14:53:02.101	\N	\N	2026-06-10 13:56:00.083	2026-06-17 10:57:56.741
cmq682qpf0001rz1rvezwdp40	120363428924511943	88 VINEYARDS	https://chat.whatsapp.com/BtP0MXOcJQ4LdIa02vo0sB	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-07-14 06:50:19.751	\N	\N	2026-06-09 05:51:52.756	2026-06-17 10:57:57.564
cmpv74kwa001dxl3sii6ejuuj	120363425514400353	⋆˚✿˖°ᴄɪᴇʟᴏ ᴀᴘᴘ ᴘʀᴇᴍɪᴜᴍ | ᴛᴏᴘ-ᴜᴘ ɢᴀᴍᴇ❀༘⋆🌷🫧💭₊˚ෆ	https://chat.whatsapp.com/FXrftKm6k7P6RNA2Liqvlr	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-06-22 15:39:31.592	\N	\N	2026-06-01 12:39:50.987	2026-06-17 10:57:58.705
cmq651st900013d1o8uranzrs	120363408005317080	ᥲᥡrᥲᥲ's s𝗍᥆rᥱ🍰 | wdp fast 27.5 | wdp fast 1xid 25.5 | wdp 1xid slow 19k | apk prem✅	https://chat.whatsapp.com/GlPbdCuDCAwJT0S8nLi3MQ	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-10 04:26:53.882	\N	\N	2026-06-09 04:27:09.981	2026-06-15 08:40:09.468
cmpzm1axz0001lfl9eblabvwf	120363407501046089	🌊ARISAN KICISI ROOM'S	https://chat.whatsapp.com/GJZ2gdlEOy9Ctln0ql8K8V	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	t	2126-05-11 14:47:12.037	\N	\N	2026-06-04 14:48:17.063	2026-06-17 10:57:58.93
cmq7tzftg0001oga7rbbin12h	120363424263426768	ȷ⍴𝖿 Ꮗ𝗂𝗍𝗁 ઽρօ𐓣ց౿ᑲօᑲ🧽.	https://chat.whatsapp.com/IxFQGQrIDr2JkcA30L5ICu	cmpv6yrr50001ov51ummvb8wu	2	ENDED	BOT	f	2026-06-17 09:48:15.381	\N	\N	2026-06-10 08:52:56.404	2026-06-17 09:49:09.19
cmqhe8qxp0001noe8h40cgjy1	120363026025251282	❥ ˋ STUFPREM | RESS ♡ ˚.l	https://chat.whatsapp.com/HK3gWM7TuvhHdjqwYlMSAQ?mode=gi_t	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2026-07-18 01:29:38.641	\N	\N	2026-06-17 01:29:58.622	2026-06-17 01:39:58.618
cmqb0qonu0001bkj6q2kgdadl	120363304508175513	PINOKIO GROUP ARISAN 🏆	https://chat.whatsapp.com/Gi2D5GF7jr4BEqkrHOjORQ	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-09-11 17:24:17.959	\N	\N	2026-06-12 14:25:23.802	2026-06-17 10:57:59.37
cmq4zk63n0001c08jcfq9egu6	120363425601095217	rayi-arull- dann trioo	https://chat.whatsapp.com/CoCfcdepNfXHblf9LFoVJw	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	t	2026-07-09 10:05:09.541	\N	\N	2026-06-08 09:05:43.14	2026-06-12 07:52:21.361
cmqamrsq00001aqv1ul7iuqya	120363429617859900	\N	https://chat.whatsapp.com/KkXB3V6ehDT8fBiBBm0udo	cmpv6yrr50001ov51ummvb8wu	1	ENDED	BOT	t	2026-07-08 08:53:21.778	\N	\N	2026-06-12 07:54:21.096	2026-06-12 09:31:49.749
cmqismgzk0001q49bdzbfh9h6	120363426906168884	QUEENS DAPIN&ARISAN 2	https://chat.whatsapp.com/H8A22GDCfpzJP0NsJhetEg	cmpv6yrr50001ov51ummvb8wu	2	ACTIVE	BOT	f	2026-09-16 01:59:22.46	\N	\N	2026-06-18 01:00:19.712	2026-06-18 01:15:43.857
cmqaqu1m40007qdwzhc4w4gdu	120363424907879436	. # ; KYNREATIVE STORE // PO SL JULI 35K SL AGUST 33K	https://chat.whatsapp.com/Jgof1WQCAhhJG4OZapyf8h	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	WEBSITE	f	2026-07-12 09:47:42.527	085150623266	\N	2026-06-12 09:48:04.397	2026-06-17 02:41:06.948
cmpv735s70007xl3s9v95h6hl	120363416973950991	𝐉𝐄𝐙𝐙𝐀 𝐒𝐓𝐎𝐑𝐄 || TOPUP DIAMOND	\N	cmpv6ytjh000aov51dqfklid9	1	ACTIVE	BOT	f	2126-05-25 04:02:46.112	\N	\N	2026-06-01 12:38:44.744	2026-06-18 04:02:46.115
\.


ALTER TABLE public."Rental" ENABLE TRIGGER ALL;

--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."Order" DISABLE TRIGGER ALL;

COPY public."Order" (id, "orderCode", "botTypeId", "botInstance", duration, "customDays", "isPremium", "groupLink", "contactPhone", "normalizedPhone", "contactEmail", "totalPrice", status, "paymentId", "paymentUrl", "paidAt", "expiresAt", notes, "rentalId", "createdAt", "updatedAt", "qrImage") FROM stdin;
cmq7k0bfv0001125erj5hxwm8	ORD-Q8EFBKXK	cmpv6ytjh000aov51dqfklid9	1	MONTHLY	\N	f	https://chat.whatsapp.com/Ke2Bfqhiz3MEQCgmEdefgo	083171795840	\N	\N	6000	SUCCESS	DEP1781064822164	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI520454115303360540464885802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163043D0F	2026-06-10 04:14:19.091	2026-07-10 04:14:19.091	SELLER APK JUY	cmpv735tb000jxl3s5kr6egcn	2026-06-10 04:13:41.227	2026-06-11 05:59:36.628	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI520454115303360540464885802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163043D0F
cmqb1haho0003bkj6gtjkl67b	ORD-SDUETQ2V	cmpv6yrr50001ov51ummvb8wu	2	MONTHLY	\N	t	https://chat.whatsapp.com/C2JbIyQfyC8I5rSIqXNSUd	0881080520703	\N	\N	8000	SUCCESS	DEP1781275566185	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI520454115303360540483145802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163041870	2026-06-12 14:46:49.385	2026-07-12 14:46:49.385	FAILED: Gagal join: account_reachout_restricted	\N	2026-06-12 14:46:05.149	2026-06-12 14:48:28.898	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI520454115303360540483145802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163041870
cmqaqsq500001qdwzo6y7vs01	ORD-SB9GJAR2	cmpv6ytjh000aov51dqfklid9	1	MONTHLY	\N	f	https://chat.whatsapp.com/Jgof1WQCAhhJG4OZapyf8h	085150623266	\N	kyraxylenam@gmail.com	6000	SUCCESS	DEP1781257623774	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI520454115303360540463875802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163040600	2026-06-12 09:47:42.527	2026-07-12 09:47:42.527	. # ; KYNREATIVE STORE // TOP UP, APP PREM, COMISSION ))	cmqaqu1m40007qdwzhc4w4gdu	2026-06-12 09:47:02.869	2026-06-12 09:48:04.404	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI520454115303360540463875802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163040600
cmpworspy0001111vudx473lz	ORD-LA8CCF53	cmpv6yrr50001ov51ummvb8wu	1	CUSTOM	2	f	https://chat.whatsapp.com/LesFz5VcS7jBYNmgoJnvBB	085135252485	\N	\N	334	SUCCESS	DEP1780407694772	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI52045411530336054034805802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163040B66	2026-06-02 13:42:26.046	2026-06-04 13:42:26.046	omak test order	cmpwotdpm0001el0ay15fbucm	2026-06-02 13:41:33.862	2026-06-02 13:42:47.728	https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=00020101021226670016COM.NOBUBANK.WWW01189360050300000879140214438109283339620303UMI51440014ID.CO.QRIS.WWW0215ID20253726257690303UMI52045411530336054034805802ID5921RAMAA%20STORE%20OK21894766008LAMONGAN61056221162070703A0163040B66
\.


ALTER TABLE public."Order" ENABLE TRIGGER ALL;

--
-- Data for Name: OrderLog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."OrderLog" DISABLE TRIGGER ALL;

COPY public."OrderLog" (id, "orderId", action, details, "createdAt") FROM stdin;
cmpwortjo0003111vykqcg3y4	cmpworspy0001111vudx473lz	ORDER_CREATED	Order dibuat, menunggu pembayaran	2026-06-02 13:41:34.933
cmpwosx0j000112hdwtj1hygp	cmpworspy0001111vudx473lz	PAYMENT_SUCCESS	Pembayaran berhasil. Aktif sampai 4/6/2026	2026-06-02 13:42:26.083
cmpwotdpz0003el0a0ft2vk36	cmpworspy0001111vudx473lz	BOT_JOINED	Bot join: omak test order	2026-06-02 13:42:47.736
cmq7k0ca70003125etw5l2j96	cmq7k0bfv0001125erj5hxwm8	ORDER_CREATED	Order dibuat, menunggu pembayaran	2026-06-10 04:13:42.32
cmq7k14nv0005125epirrg1py	cmq7k0bfv0001125erj5hxwm8	PAYMENT_SUCCESS	Pembayaran berhasil. Aktif sampai 10/7/2026	2026-06-10 04:14:19.099
cmq938dyz00016fskre4dvt4t	cmq7k0bfv0001125erj5hxwm8	BOT_EXTENDED	Sewa diperpanjang: SELLER APK JUY	2026-06-11 05:59:36.636
cmqaqsqy40003qdwzsrmb16j6	cmqaqsq500001qdwzo6y7vs01	ORDER_CREATED	Order dibuat, menunggu pembayaran	2026-06-12 09:47:03.917
cmqaqtkqv0005qdwznscsr5y2	cmqaqsq500001qdwzo6y7vs01	PAYMENT_SUCCESS	Pembayaran berhasil. Aktif sampai 12/7/2026	2026-06-12 09:47:42.536
cmqaqu1mj0009qdwzwy2xl4ye	cmqaqsq500001qdwzo6y7vs01	BOT_JOINED	Bot join: . # ; KYNREATIVE STORE // TOP UP, APP PREM, COMISSION ))	2026-06-12 09:48:04.412
cmqb1hbex0005bkj6stskkt58	cmqb1haho0003bkj6gtjkl67b	ORDER_CREATED	Order dibuat, menunggu pembayaran	2026-06-12 14:46:06.346
cmqb1i8o700014eyc1gq70ajd	cmqb1haho0003bkj6gtjkl67b	PAYMENT_SUCCESS	Pembayaran berhasil. Aktif sampai 12/7/2026	2026-06-12 14:46:49.448
cmqb1kdei0007bkj6dm8outwo	cmqb1haho0003bkj6gtjkl67b	BOT_EXTENDED	Sewa diperpanjang manual oleh Admin.	2026-06-12 14:48:28.89
\.


ALTER TABLE public."OrderLog" ENABLE TRIGGER ALL;

--
-- Data for Name: Price; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."Price" DISABLE TRIGGER ALL;

COPY public."Price" (id, "botTypeId", duration, tier, "customDays", price, "createdAt", "updatedAt") FROM stdin;
cmpv9yobd0000sxgfwfiulebj	cmpv6yrr50001ov51ummvb8wu	WEEKLY	basic	\N	2000	2026-06-01 13:59:14.329	2026-06-01 13:59:14.329
cmpv9yobd0001sxgf8ux99c7f	cmpv6yrr50001ov51ummvb8wu	MONTHLY	basic	\N	5000	2026-06-01 13:59:14.329	2026-06-01 13:59:14.329
cmpv9yobd0002sxgf6ry7o094	cmpv6yrr50001ov51ummvb8wu	CUSTOM	basic	\N	167	2026-06-01 13:59:14.329	2026-06-01 13:59:14.329
cmpv9yobd0003sxgfnumkkder	cmpv6yrr50001ov51ummvb8wu	WEEKLY	premium	\N	3000	2026-06-01 13:59:14.329	2026-06-01 13:59:14.329
cmpv9yobd0004sxgf8vf9xm0y	cmpv6yrr50001ov51ummvb8wu	MONTHLY	premium	\N	8000	2026-06-01 13:59:14.329	2026-06-01 13:59:14.329
cmpv9yobd0005sxgf2ooje9ql	cmpv6yrr50001ov51ummvb8wu	CUSTOM	premium	\N	267	2026-06-01 13:59:14.329	2026-06-01 13:59:14.329
cmpvewfza0000qefvmd5mxob6	cmpv6ytjh000aov51dqfklid9	WEEKLY	basic	\N	2000	2026-06-01 16:17:28.295	2026-06-01 16:17:28.295
cmpvewfzb0001qefvjwk8a2b0	cmpv6ytjh000aov51dqfklid9	MONTHLY	basic	\N	6000	2026-06-01 16:17:28.295	2026-06-01 16:17:28.295
cmpvewfzb0002qefvqkmctffo	cmpv6ytjh000aov51dqfklid9	CUSTOM	basic	\N	200	2026-06-01 16:17:28.295	2026-06-01 16:17:28.295
\.


ALTER TABLE public."Price" ENABLE TRIGGER ALL;

--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public."SiteSettings" DISABLE TRIGGER ALL;

COPY public."SiteSettings" (id, "siteName", "siteLogo", "pakasirApiKey", "pakasirSlug", "telegramToken", "telegramChatId", "telegramLogChatId", "contactWhatsapp", "contactTelegram", "channelWhatsapp", "paymentProvider", "ramashopApiKey", "qrispayApiKey", "adminFee", "adminFeePercent", maintenance, "maintenanceMsg") FROM stdin;
main	KWOCAG	https://files.catbox.moe/vms1wj.jpg	chuLlTmvIq3rtp6WxCyglK3VABzHKEih	raen	8614783299:AAFcBuzKsM0Ha0GAs7YeoNMIy2LroP30WP4	-1003612789437	-1003912068251	62895366006918	idkidgafuck	https://whatsapp.com/channel/0029Vaoc8qL6rsQnsjajCW0v	ramashop	rg_0882480917bc13c2dbe4f83adb701a	qpk_user_6389df0b50707bccf71c1929fd827dc26c85	0	0	t	Maintenance Dulu kak, mau pindah database
\.


ALTER TABLE public."SiteSettings" ENABLE TRIGGER ALL;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public._prisma_migrations DISABLE TRIGGER ALL;

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
473b51a7-59a5-4e7b-8491-b8ffc6340f11	30d46c98c00ccec9b6b1729b11d5a5659de484259ac04ca7b07695ba6a74ebc3	2026-06-01 11:11:57.662041+00	20260601111153_add_bot_instance_to_rental	\N	\N	2026-06-01 11:11:56.064673+00	1
866ce286-956c-4bef-90d1-7c06a2e5b2bf	956977d0358b8eceb2c205e80b8ff24ced1ae3d4794866bdde2a663dc385432f	2026-06-02 13:21:27.894524+00	20260602132125_add_qr_image_field	\N	\N	2026-06-02 13:21:26.481501+00	1
3ab376fc-a2c7-4579-bf64-56186f35231c	ef0b820cc42ae10f1d7ab1edfc0bb9c45a8cf07b086aff313105687507fa18c0	2026-06-03 04:58:57.219166+00	20260603045853_add_bot_heartbeat	\N	\N	2026-06-03 04:58:55.426573+00	1
\.


ALTER TABLE public._prisma_migrations ENABLE TRIGGER ALL;

--
-- Data for Name: playing_with_neon; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

ALTER TABLE public.playing_with_neon DISABLE TRIGGER ALL;

COPY public.playing_with_neon (id, name, value) FROM stdin;
1	c4ca4238a0	0.13340317
2	c81e728d9d	0.72420985
3	eccbc87e4b	0.13417862
4	a87ff679a2	0.4960752
5	e4da3b7fbb	0.00793335
6	1679091c5a	0.272073
7	8f14e45fce	0.57429224
8	c9f0f895fb	0.6227873
9	45c48cce2e	0.50567675
10	d3d9446802	0.9210704
\.


ALTER TABLE public.playing_with_neon ENABLE TRIGGER ALL;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.playing_with_neon_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

\unrestrict edMzihSk1irhjpSc132E0YJv2gVSYzTA6PPK50GO9wZJLNRNWKDn54ddqrxYeYZ

