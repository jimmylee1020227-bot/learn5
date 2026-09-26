import { getHardEnglishQuestion } from './englishHardArchetypes.js';

// 108 課綱英語全單元題庫引擎（覆蓋國一至國三、會考歷屆與私校進階，杜絕重複題，題庫庫容充沛）
export function generateEnglishQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hard' || difficulty === 'hardest';
  const people = ['Amy', 'Brian', 'Claire', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 'Leo', 'Mia'];
  const person = people[Math.floor(rand() * people.length)];
  const preamble = `While practicing English, ${person} encountered the following question:`;

  const uNum = parseInt(String(unitId).split('-').pop().replace(/u/i, ''), 10) || 1;

  // ── 進階挑戰難度分流 (Extreme / Hardest)：每 4 題抽樣一次高階原型，其餘回歸豐沛單元庫 ──
  if (isExtreme && (index % 4 === 0)) {
    const hardQ = getHardEnglishQuestion(gradeId, unitId, index, rand, preamble, conceptTag);
    if (hardQ) return hardQ;
  }

  // ============================================================
  // 國一 (七年級)
  // ============================================================
  if (gradeId === 'g7') {
    // u1: Be動詞、打招呼與教室英語、代名詞
    if (uNum === 1) {
      const archetypes = [
        () => ({
          question: `【Be動詞與人稱代名詞主格】${preamble}\n________ are my new classmates, and ________ names are Leo and Mia.`,
          options: [`They; their`, `Their; they`, `They; them`, `Them; their`],
          answer: 0,
          hint: `💡 提示：主詞位置用主格 They；修飾名詞 names 用所有格 their。`,
          explanation: `📖 詳解：第一格為主詞用主格代名詞 They；第二格修飾複數名詞 names，需用所有格 their。`
        }),
        () => ({
          question: `【Be動詞疑問句與簡答】${preamble}\n— "________ your English teacher from Canada?"\n— "Yes, she ________."`,
          options: [`Is; is`, `Are; is`, `Does; does`, `Is; does`],
          answer: 0,
          hint: `💡 提示：主詞 your English teacher 為單數第三人稱，肯定簡答用 Yes, she is.（不可縮寫）。`,
          explanation: `📖 詳解：主詞為單數，be動詞用 Is 開頭疑問句；肯定簡答必須完整寫出 Yes, she is.，不可寫作 Yes, she's.`
        }),
        () => ({
          question: `【代名詞受格與介系詞搭配】${preamble}\nMr. White is talking to ________ now. Please listen to ________ carefully.`,
          options: [`us; him`, `we; he`, `our; his`, `us; he`],
          answer: 0,
          hint: `💡 提示：介系詞 to 後面必須接代名詞「受格」（us / him）。`,
          explanation: `📖 詳解：介系詞 (to) 後面的代名詞需用受格：we 的受格為 us，he 的受格為 him。`
        }),
        () => ({
          question: `【所有格代名詞識別】${preamble}\nThis blue pen is not mine; it is ________. She left it on the desk.`,
          options: [`hers`, `her`, `she`, `herself`],
          answer: 0,
          hint: `💡 提示：hers = her pen（所有格代名詞，後方不加名詞）。`,
          explanation: `📖 詳解：hers 為所有格代名詞，相當於 her pen，用以指代前面提及的物品，後面不再接名詞。`
        }),
        () => ({
          question: `【反身代名詞用法】${preamble}\nThe children are old enough to look after ________ during the summer camp.`,
          options: [`themselves`, `them`, `their`, `theirs`],
          answer: 0,
          hint: `💡 提示：主詞與受詞為同一群人時，受詞使用反身代名詞 themselves。`,
          explanation: `📖 詳解：主詞 the children 照顧的對象是「他們自己」，主受詞同一主體，需用反身代名詞 themselves。`
        }),
        () => ({
          question: `【指示代名詞 This / That / These / Those】${preamble}\nLook at ________ birds in the tall tree over there! They are beautiful.`,
          options: [`those`, `these`, `this`, `that`],
          answer: 0,
          hint: `💡 提示：over there 表示遠處，且名詞 birds 為複數，用 those。`,
          explanation: `📖 詳解：over there（在那邊遠處）搭配複數名詞 birds，指示代名詞需使用 those。`
        }),
        () => ({
          question: `【Be動詞否定句與縮寫】${preamble}\nMy cousin and I ________ in the same classroom; we are in different grades.`,
          options: [`are not`, `is not`, `am not`, `not are`],
          answer: 0,
          hint: `💡 提示：主詞 My cousin and I 為兩個人（複數），be動詞用 are not。`,
          explanation: `📖 詳解：My cousin and I 為複數主詞（相當於 we），搭配複數否定 be 動詞 are not 或 aren't。`
        }),
        () => ({
          question: `【教室英語祈使規範】${preamble}\n"Class, please ________ to page 45 and read the dialogue together."`,
          options: [`turn`, `turning`, `turned`, `to turn`],
          answer: 0,
          hint: `💡 提示：祈使句以原形動詞開頭或放在 please 後面。`,
          explanation: `📖 詳解：教室指令與祈使句中，please 後直接接動詞原形 turn to page ...。`
        }),
        () => ({
          question: `【打招呼與初次見面慣用語】${preamble}\n— "Nice to meet you, I am Ken."\n— "________"`,
          options: [`Nice to meet you, too.`, `Good luck!`, `You're welcome.`, `Never mind.`],
          answer: 0,
          hint: `💡 提示：初次見面對方說 Nice to meet you，標準禮貌回應為 Nice to meet you, too.`,
          explanation: `📖 詳解：日常英文初次介紹見面時，標準對應用語為 Nice to meet you, too.。`
        }),
        () => ({
          question: `【日常物品名詞單複數】${preamble}\nThere are three ________ and two ________ on the teacher's desk.`,
          options: [`boxes; watches`, `boxs; watchs`, `boxies; watchies`, `box; watch`],
          answer: 0,
          hint: `💡 提示：字尾為 -x, -ch 時，複數名詞加 -es (boxes, watches)。`,
          explanation: `📖 詳解：名詞字尾以 -s, -x, -ch, -sh 結尾者，形成複數時需加 -es：box -> boxes；watch -> watches。`
        }),
        () => ({
          question: `【特殊不規則複數名詞】${preamble}\nMany ________ and ________ are playing games happily in the park.`,
          options: [`children; men`, `childs; mans`, `childrens; mens`, `child; man`],
          answer: 0,
          hint: `💡 提示：child 的複數為 children；man 的複數為 men。`,
          explanation: `📖 詳解：child 與 man 為不規則複數名詞，複數形式分別為 children 與 men，後面不需再加 s。`
        }),
        () => ({
          question: `【人稱代名詞與 Be 動詞綜合句型】${preamble}\n— "Who ________ that tall boy standing by the door?"\n— "________ is my elder brother, Kevin."`,
          options: [`is; He`, `are; He`, `is; Him`, `are; His`],
          answer: 0,
          hint: `💡 提示：that tall boy 為單數第三人稱，be動詞用 is；答句主詞用主格 He。`,
          explanation: `📖 詳解：單數名詞 that tall boy 搭配 is；答句指代陽性單數主詞用主格 He。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u2: 現在簡單式、第三人稱單數動詞與頻率副詞
    if (uNum === 2) {
      const archetypes = [
        () => ({
          question: `【現在簡單式第三人稱單數動詞變化】${preamble}\nMy brother ________ early on weekdays, but he ________ up late on Sundays.`,
          options: [`always gets; wakes`, `gets always; wake`, `always get; wake`, `is always getting; wake`],
          answer: 0,
          hint: `💡 提示：頻率副詞放在一般動詞前面；主詞 brother 為第三人稱單數，動詞需加 s。`,
          explanation: `📖 詳解：頻率副詞 (always) 放置於一般動詞之前；第三人稱單數現在簡單式動詞加 s (gets / wakes)。`
        }),
        () => ({
          question: `【頻率副詞在 Be 動詞之後的位置】${preamble}\nTom is a hardworking student. He ________ late for school.`,
          options: [`is seldom`, `seldom is`, `does seldom be`, `seldom does`],
          answer: 0,
          hint: `💡 提示：頻率副詞位置口訣：在 be 動詞之後，在一般動詞之前。`,
          explanation: `📖 詳解：頻率副詞 (seldom/never/always) 放在 Be 動詞 (is) 之後，故選 is seldom late。`
        }),
        () => ({
          question: `【第三人稱單數去 y 加 ies】${preamble}\nLinda ________ math every night, and she ________ hard to get good grades.`,
          options: [`studies; tries`, `studys; trys`, `study; try`, `is studying; trying`],
          answer: 0,
          hint: `💡 提示：子音 + y 結尾之動詞，第三人稱單數需去 y 改加 -ies (studies, tries)。`,
          explanation: `📖 詳解：study 與 try 均為子音字母 + y 結尾，在第三人稱單數現在簡單式時，規則為去 y 改加 -ies (studies, tries)。`
        }),
        () => ({
          question: `【現在簡單式助動詞 do/does 疑問句】${preamble}\n— "________ your parents ________ coffee every morning?"\n— "No, they prefer black tea."`,
          options: [`Do; drink`, `Does; drink`, `Do; drinks`, `Are; drink`],
          answer: 0,
          hint: `💡 提示：主詞 your parents 為複數，疑問句助動詞用 Do，後方動詞回歸原形 drink。`,
          explanation: `📖 詳解：複數主詞 (parents) 搭配助動詞 Do；助動詞後方之一般動詞必須使用原形動詞 (drink)。`
        }),
        () => ({
          question: `【現在簡單式否定句 doesn't + 原形動詞】${preamble}\nSam is allergic to seafood. He ________ any fish or shrimp.`,
          options: [`doesn't eat`, `don't eat`, `doesn't eats`, `not eats`],
          answer: 0,
          hint: `💡 提示：單數第三人稱否定用 doesn't + 原形動詞 eat。`,
          explanation: `📖 詳解：第三人稱單數 (Sam) 現在簡單式否定句結構為 doesn't + 原形動詞 (eat)。`
        }),
        () => ({
          question: `【have / has 的用法區別】${preamble}\nMr. Brown ________ a big garden, and his daughters ________ many cute rabbits in it.`,
          options: [`has; have`, `have; has`, `has; has`, `have; have`],
          answer: 0,
          hint: `💡 提示：單數第三人稱用 has；複數名詞 daughters 用 have。`,
          explanation: `📖 詳解：Mr. Brown 為單數主詞，動詞用 has；his daughters 為複數主詞，動詞用 have。`
        }),
        () => ({
          question: `【頻率副詞回答 How often 疑問句】${preamble}\n— "How often do you go jogging?"\n— "I go jogging ________."`,
          options: [`twice a week`, `two times`, `last week`, `in two days`],
          answer: 0,
          hint: `💡 提示：How often 詢問頻率，回答使用 twice a week（一週兩次）等次數片語。`,
          explanation: `📖 詳解：How often 用以詢問事情發生的頻率，正確回應應為 twice a week / once a month 等頻率次數片語。`
        }),
        () => ({
          question: `【一般動詞字尾加 -es 規則】${preamble}\nEvery afternoon, Grandma ________ TV and Uncle John ________ the dishes.`,
          options: [`watches; washes`, `watchs; washs`, `watching; washing`, `watch; wash`],
          answer: 0,
          hint: `💡 提示：字尾為 -ch, -sh 時，第三人稱單數動詞加 -es (watches, washes)。`,
          explanation: `📖 詳解：watch 和 wash 的字尾分別為 -ch 與 -sh，第三人稱單數動詞需加 -es。`
        }),
        () => ({
          question: `【頻率副詞在助動詞與簡答句中的位置】${preamble}\n— "Is Peter always on time for the meeting?"\n— "Yes, he ________."`,
          options: [`always is`, `is always`, `always does`, `does always`],
          answer: 0,
          hint: `💡 提示：在簡答句中，頻率副詞需放在 be 動詞或助動詞「之前」（Yes, he always is.）。`,
          explanation: `📖 詳解：頻率副詞在簡答句中必須置於助動詞或 be 動詞之前，故答句為 Yes, he always is.，不可寫成 he is always。`
        }),
        () => ({
          question: `【客觀真理與科學事實時態】${preamble}\nOur science teacher taught us that the Earth ________ around the Sun.`,
          options: [`revolves`, `revolved`, `is revolving`, `will revolve`],
          answer: 0,
          hint: `💡 提示：客觀真理、科學定律與自然常態，一律使用「現在簡單式」。`,
          explanation: `📖 詳解：即使主要子句動詞為過去式 taught，但引導的名詞子句描述的是「地球繞太陽公轉」這項永恆客觀之科學真理，時態必須保持現在簡單式 (revolves)。`
        }),
        () => ({
          question: `【時間副詞與現在簡單式搭配】${preamble}\nOur school bus ________ at 7:15 every morning without delay.`,
          options: [`arrives`, `is arriving`, `arrived`, `has arrived`],
          answer: 0,
          hint: `💡 提示：every morning 表示規律習慣，使用現在簡單式第三人稱單數 arrives。`,
          explanation: `📖 詳解：every morning（每天早晨）表示固定的日常生活習慣，主詞 our school bus 為單數，動詞需加 s (arrives)。`
        }),
        () => ({
          question: `【生活作息與日常片語】${preamble}\nAfter dinner, Alice usually ________ a walk with her pet dog in the community.`,
          options: [`takes`, `take`, `is taking`, `took`],
          answer: 0,
          hint: `💡 提示：take a walk 散步，主詞 Alice 為第三人稱單數，動詞用 takes。`,
          explanation: `📖 詳解：usually 搭配現在簡單式，主詞 Alice 為單數第三人稱，動詞使用 takes。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u3: 現在進行式與祈使句
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【現在進行式與祈使句句型】${preamble}\nListen! The birds ________ outside. Please ________ quiet so we can hear them.`,
          options: [`are singing; be`, `sing; are`, `is singing; be`, `are singing; to be`],
          answer: 0,
          hint: `💡 提示：Listen! 提示動作正在發生 (be + V-ing)；祈使句動詞用原形 (be)。`,
          explanation: `📖 詳解：感官動詞 Listen! 提示當下正在進行，複數主詞 birds 搭配 are singing；祈使句 Please 後接原形動詞 be quiet。`
        }),
        () => ({
          question: `【否定祈使句用法】${preamble}\n________ the street when the traffic light is red. It's dangerous!`,
          options: [`Don't cross`, `Not cross`, `Doesn't cross`, `No crossing`],
          answer: 0,
          hint: `💡 提示：否定祈使句句型為：Don't + 原形動詞。`,
          explanation: `📖 詳解：否定祈使句標準句型為 Don't + 原形動詞 (cross)，用以告誡或命令禁止某行為。`
        }),
        () => ({
          question: `【現在進行式現在時間副詞 now / at the moment】${preamble}\nLook! The little baby ________ across the living room carpet right now.`,
          options: [`is crawling`, `crawls`, `crawled`, `will crawl`],
          answer: 0,
          hint: `💡 提示：Look! 與 right now 明確指示說話當下正在發生的動作，需用現在進行式。`,
          explanation: `📖 詳解：Look! 與 right now 為進行式常見標誌，單數主詞 the little baby 搭配 is crawling。`
        }),
        () => ({
          question: `【動詞加 ing 重複字尾規則】${preamble}\nSeveral runners ________ along the riverside track in the morning sun.`,
          options: [`are jogging`, `are joging`, `jog`, `is jogging`],
          answer: 0,
          hint: `💡 提示：jog 為「單音節、短母音 + 單子音」，加 -ing 時需重複字尾 g (jogging)。`,
          explanation: `📖 詳解：jog 是單音節短母音動詞，加 -ing 時需重複子音 g 成為 jogging；主詞 runners 為複數，搭配 are jogging。`
        }),
        () => ({
          question: `【不適用於進行式的狀態動詞】${preamble}\nI ________ what you mean now. Let me explain the details to you.`,
          options: [`understand`, `am understanding`, `understood`, `have understood`],
          answer: 0,
          hint: `💡 提示：understand（理解）、know（知道）、like（喜歡）等知覺與心理狀態動詞通常不使用進行式。`,
          explanation: `📖 詳解：表示認知、心理狀態或所有權的動詞（如 understand, know, like, have 表擁有），習慣使用現在簡單式，不使用進行式。`
        }),
        () => ({
          question: `【Let's 祈使句與反意疑問句】${preamble}\n________ take a rest under that shady tree, shall we?`,
          options: [`Let's`, `Let us not`, `Do`, `Please`],
          answer: 0,
          hint: `💡 提示：Let's 表提議「我們一起...吧」，後方反問常用 shall we?`,
          explanation: `📖 詳解：Let's + 原形動詞表示第一人稱複數之提議，附加問句對應 shall we?。`
        }),
        () => ({
          question: `【公共標誌與禁止祈使句 No + V-ing】${preamble}\nAccording to the sign on the library wall: "________, please!"`,
          options: [`No eating or drinking`, `Don't eating`, `No eat or drink`, `Not drink`],
          answer: 0,
          hint: `💡 提示：公共標誌禁止用語常用 No + V-ing (No smoking / No parking)。`,
          explanation: `📖 詳解：告示牌常用的禁止標語結構為 No + V-ing，如 No eating or drinking / No smoking。`
        }),
        () => ({
          question: `【進行式之動詞去 e 加 ing 規則】${preamble}\nGrandpa and Grandma ________ delicious apple pies in the kitchen now.`,
          options: [`are baking`, `are bakeing`, `is baking`, `bake`],
          answer: 0,
          hint: `💡 提示：bake 去不發音的 e 再加 ing (baking)；主詞為兩個人用 are。`,
          explanation: `📖 詳解：動詞 bake 字尾為不發音的 e，去 e 加 ing 成為 baking；主詞為複數，搭配 are baking。`
        }),
        () => ({
          question: `【祈使句以 Be 動詞開頭】${preamble}\n________ careful when you ride your bike in the heavy rain!`,
          options: [`Be`, `Are`, `Do`, `Being`],
          answer: 0,
          hint: `💡 提示：祈使句後接形容詞 careful 時，需以原形 Be 動詞開頭。`,
          explanation: `📖 詳解：careful 為形容詞，祈使句開頭必須使用原形 Be 動詞 (Be careful)。`
        }),
        () => ({
          question: `【進行式疑問句語序】${preamble}\n— "What ________ Jenny ________ on her laptop right now?"\n— "She is writing an essay."`,
          options: [`is; typing`, `does; type`, `is; type`, `are; typing`],
          answer: 0,
          hint: `💡 提示：現在進行式疑問句語序：疑問詞 + is/are + 主詞 + V-ing?`,
          explanation: `📖 詳解：Jenny 為單數主詞，現在進行式疑問句使用 is Jenny typing。`
        }),
        () => ({
          question: `【祈使句與對話稱呼語的位置】${preamble}\n"________, Peter, and listen to the instructions carefully."`,
          options: [`Sit down`, `Sitting down`, `To sit down`, `Sits down`],
          answer: 0,
          hint: `💡 提示：祈使句向對方下指令，一律使用原形動詞 Sit down。`,
          explanation: `📖 詳解：指令祈使句以原形動詞開頭 (Sit down)，稱呼語 Peter 以逗號隔開。`
        }),
        () => ({
          question: `【現在進行式表示即將發生之未來計畫】${preamble}\nMr. Davis ________ for Tokyo tomorrow morning for an important business conference.`,
          options: [`is leaving`, `leaves`, `left`, `has left`],
          answer: 0,
          hint: `💡 提示：來去動詞（leave, go, come, arrive）可用現在進行式代替即將發生的未來式。`,
          explanation: `📖 詳解：位移動詞 (leave, come, go, arrive) 常用現在進行式 (is leaving) 來表達已確定排定的近期未來行程。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u4: There is/are 與空間介系詞
    if (uNum === 4) {
      const archetypes = [
        () => ({
          question: `【There is/are 存在句單複數搭配】${preamble}\n________ some milk and three apples ________ the refrigerator.`,
          options: [`There is; in`, `There are; in`, `There have; on`, `It is; under`],
          answer: 0,
          hint: `💡 提示：There is/are 遵循「就近原則」，緊鄰的 some milk 為不可數名詞，故用 is。在冰箱內部用 in。`,
          explanation: `📖 詳解：There is/are 句型的 be 動詞由緊隨其後的第一個名詞決定：some milk 為不可數單數名詞，使用 is；在冰箱內部介系詞用 in。`
        }),
        () => ({
          question: `【方位介系詞辨析 between vs among】${preamble}\nThe convenient store is located ________ the bank and the bookstore.`,
          options: [`between`, `among`, `in front`, `next`],
          answer: 0,
          hint: `💡 提示：在兩者之間用 between A and B；在三者或以上之中用 among。`,
          explanation: `📖 詳解：between A and B 為固定介系詞片語，代表「在兩者之間」。`
        }),
        () => ({
          question: `【There is/are 過去式存在句】${preamble}\nTwenty years ago, ________ only a small village here, but now there are many skyscrapers.`,
          options: [`there was`, `there were`, `there is`, `there are`],
          answer: 0,
          hint: `💡 提示：Twenty years ago 提示過去時間，且 a small village 為單數，用 there was。`,
          explanation: `📖 詳解：過去時間 (Twenty years ago) 搭配單數名詞 a small village，存在句需用過去單數 there was。`
        }),
        () => ({
          question: `【There is/are 疑問句與簡答】${preamble}\n— "________ any clean glasses in the kitchen cabinet?"\n— "Yes, ________."`,
          options: [`Are there; there are`, `Is there; there is`, `Are they; they are`, `Do there; there do`],
          answer: 0,
          hint: `💡 提示：clean glasses 為複數名詞，疑問句用 Are there...；簡答用 Yes, there are.`,
          explanation: `📖 詳解：名詞 glasses 為複數，疑問句用 Are there；肯定簡答一律用 Yes, there are.（不可縮寫）。`
        }),
        () => ({
          question: `【空間介系詞 next to vs near】${preamble}\nThe post office is right ________ the bakery; they share a common wall.`,
          options: [`next to`, `near to`, `across`, `between`],
          answer: 0,
          hint: `💡 提示：緊鄰、緊挨著用 next to；share a common wall 提示就在隔壁。`,
          explanation: `📖 詳解：next to 表示「緊鄰在旁」（緊貼隔壁）；near 後方不加 to。`
        }),
        () => ({
          question: `【空間介系詞 in front of vs in the front of】${preamble}\nThe brave driver sat ________ the bus and focused on the winding road ahead.`,
          options: [`in the front of`, `in front of`, `behind`, `under`],
          answer: 0,
          hint: `💡 提示：在（某個內部空間的）前部用 in the front of；在（物體外部的）前方用 in front of。`,
          explanation: `📖 詳解：司機坐在公車內部的最前方，表示在同一個空間內部的前端，需用 in the front of；若用 in front of 則是指站在公車車體之外的正前方。`
        }),
        () => ({
          question: `【不可數名詞在 There is 句型中】${preamble}\n________ too much pollution in this industrial river, so no fish can survive.`,
          options: [`There is`, `There are`, `It has`, `They have`],
          answer: 0,
          hint: `💡 提示：pollution 為不可數名詞，存在句使用 There is。`,
          explanation: `📖 詳解：pollution 是不可數名詞，視為單數，前面修飾語為 too much，be動詞用 is。`
        }),
        () => ({
          question: `【There will be 未來存在句】${preamble}\n________ a great music festival in our town next weekend.`,
          options: [`There will be`, `There will have`, `It will have`, `There is having`],
          answer: 0,
          hint: `💡 提示：英文絕無 There will have 說法，未來存在句固定為 There will be。`,
          explanation: `📖 詳解：There is/are 的未來式是 There will be 或 There is going to be，英文不可將 there 與 have 混用表示存在。`
        }),
        () => ({
          question: `【介系詞 across from 對面】${preamble}\nThe public library is ________ the central park, just on the other side of the road.`,
          options: [`across from`, `between`, `among`, `straight`],
          answer: 0,
          hint: `💡 提示：在...的對面用 across from。`,
          explanation: `📖 詳解：across from 表示「在...的對面」（隔著一條街或馬路）。`
        }),
        () => ({
          question: `【數量詞 a lot of 與 There are 搭配】${preamble}\nLook outside! ________ a lot of tourists taking photos in front of the historic palace.`,
          options: [`There are`, `There is`, `They have`, `There have`],
          answer: 0,
          hint: `💡 提示：tourists 為複數可數名詞，搭配 There are。`,
          explanation: `📖 詳解：a lot of tourists 為複數名詞（遊客們），存在句使用 There are。`
        }),
        () => ({
          question: `【介系詞 under vs below】${preamble}\nThe cute kitten is sleeping soundly ________ the dining table.`,
          options: [`under`, `above`, `on`, `over`],
          answer: 0,
          hint: `💡 提示：在桌子下方正下方位置用 under。`,
          explanation: `📖 詳解：under 指在物體垂直下方的立體空間遮蔽處，如 under the table。`
        }),
        () => ({
          question: `【There is no ... 否定存在句型】${preamble}\n________ doubt that drinking enough water every day is good for health.`,
          options: [`There is no`, `There are not`, `It is no`, `They have no`],
          answer: 0,
          hint: `💡 提示：There is no doubt that...「毫無疑問地...」為固定必考句型。`,
          explanation: `📖 詳解：There is no doubt that... 為英語重要慣用句型，意為「毫無疑問的是...」，doubt 在此為不可數名詞。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u5: 時間日期與助動詞 Can/May/Must
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【時間介系詞 at / on / in 規範】${preamble}\nThe concert will begin ________ 7:30 p.m. ________ Saturday evening.`,
          options: [`at; on`, `on; in`, `at; in`, `in; on`],
          answer: 0,
          hint: `💡 提示：具體鐘點時刻用 at；特定某天或某天的早中晚用 on。`,
          explanation: `📖 詳解：具體點鐘 (7:30 p.m.) 搭配介系詞 at；特定某天的早中晚 (Saturday evening) 搭配介系詞 on。`
        }),
        () => ({
          question: `【情態助動詞接原形動詞】${preamble}\n— "May I ________ your dictionary?"\n— "Sure, but you must ________ it back tomorrow."`,
          options: [`borrow; give`, `borrowing; gives`, `borrow; to give`, `to borrow; giving`],
          answer: 0,
          hint: `💡 提示：情態助動詞 (may / must / can) 後面必須一律接「原形動詞」。`,
          explanation: `📖 詳解：情態助動詞 May 與 must 後方一律接原形動詞 (borrow / give)。`
        }),
        () => ({
          question: `【年份與月份介系詞 in】${preamble}\nOur national hero was born ________ October ________ 1980.`,
          options: [`in; in`, `on; in`, `at; in`, `in; on`],
          answer: 0,
          hint: `💡 提示：單獨月份用 in；年份用 in；若有具體日期才用 on。`,
          explanation: `📖 詳解：在月份前用 in (in October)；在年份前用 in (in 1980)。若為 October 10th 含有具體日期才改用 on。`
        }),
        () => ({
          question: `【序數與特定日期介系詞 on】${preamble}\nThe school sports day is held ________ the first Friday of November every year.`,
          options: [`on`, `in`, `at`, `of`],
          answer: 0,
          hint: `💡 提示：特定星期或具體日子前使用介系詞 on。`,
          explanation: `📖 詳解：the first Friday 為特定日子，搭配介系詞 on。`
        }),
        () => ({
          question: `【情態助動詞 must not vs don't have to】${preamble}\nYou ________ feed the animals in the zoo; it is strictly prohibited by law!`,
          options: [`must not`, `don't have to`, `might not`, `can`],
          answer: 0,
          hint: `💡 提示：must not 表「嚴格禁止」；don't have to 僅為「不必」。`,
          explanation: `📖 詳解：must not 表示法律或規則上的「絕不可以、嚴禁」；don't have to 是「不需要」。動物園嚴禁餵食，需用 must not。`
        }),
        () => ({
          question: `【時間副詞片語 in the morning vs on a cold morning】${preamble}\nWe usually do exercises ________ the morning, but ________ Sunday morning we slept in.`,
          options: [`in; on`, `on; in`, `at; on`, `in; at`],
          answer: 0,
          hint: `💡 提示：泛指早上用 in the morning；有特定形容詞或星期修飾的早晨用 on Sunday morning。`,
          explanation: `📖 詳解：一般習慣用語為 in the morning；但前面加上特定星期或形容詞修飾時，介系詞改為 on (on Sunday morning)。`
        }),
        () => ({
          question: `【助動詞 Can 詢問能力與請求許可】${preamble}\n— "________ you play the violin?"\n— "No, but I ________ play the piano quite well."`,
          options: [`Can; can`, `Do; am`, `Are; can`, `May; do`],
          answer: 0,
          hint: `💡 提示：詢問具備某種技能或能力，使用助動詞 Can。`,
          explanation: `📖 詳解：表示個人技能或能力時使用情態助動詞 can；肯定簡述能力使用 can play。`
        }),
        () => ({
          question: `【What time vs What day 疑問詞辨析】${preamble}\n— "________ is the baseball match?"\n— "It's on Saturday afternoon."`,
          options: [`What day`, `What time`, `How often`, `How long`],
          answer: 0,
          hint: `💡 提示：回答為 Saturday afternoon (星期六下午)，詢問的是哪一天，用 What day 或 When。`,
          explanation: `📖 詳解：答句為星期幾 (Saturday)，疑問詞使用 What day（或 When）。若答句為具體鐘點如 3:00 PM 才使用 What time。`
        }),
        () => ({
          question: `【季節介系詞 in spring / in summer】${preamble}\nMany beautiful flowers bloom ________ spring, attracting thousands of tourists.`,
          options: [`in`, `on`, `at`, `with`],
          answer: 0,
          hint: `💡 提示：四季（春、夏、秋、冬）前面一律搭配介系詞 in。`,
          explanation: `📖 詳解：四季名稱（spring, summer, fall/autumn, winter）前一律搭配介系詞 in。`
        }),
        () => ({
          question: `【情態助動詞 should 的建議用法】${preamble}\nYou have a high fever. I think you ________ see a doctor right away.`,
          options: [`should`, `may`, `can`, `would`],
          answer: 0,
          hint: `💡 提示：給予強烈誠懇的忠告或建議時，使用 should (應該)。`,
          explanation: `📖 詳解：should 表示「應該、建議」，用於向生病發燒者提出就醫建議最為合適。`
        }),
        () => ({
          question: `【從...到...的介系詞 from... to...】${preamble}\nThe museum is open ________ 9:00 a.m. ________ 5:00 p.m. from Tuesday to Sunday.`,
          options: [`from; to`, `between; to`, `at; at`, `since; until`],
          answer: 0,
          hint: `💡 提示：表示時間起訖「從...到...」使用 from A to B。`,
          explanation: `📖 詳解：from ... to ... 為固定起訖搭配，表示自上午 9:00 開放至下午 5:00。`
        }),
        () => ({
          question: `【詢問星期幾的固定句型】${preamble}\n— "________ is it today?"\n— "It is Wednesday."`,
          options: [`What day`, `What date`, `What time`, `How is`],
          answer: 0,
          hint: `💡 提示：詢問星期幾用 What day is it today?；詢問幾月幾號才用 What's the date today?`,
          explanation: `📖 詳解：What day is it today? 用於詢問星期幾；What is the date today? 用於詢問日期（幾月幾日）。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }
  }

  // ============================================================
  // 國二 (八年級)
  // ============================================================
  if (gradeId === 'g8') {
    // u1: 過去簡單式與不規則動詞
    if (uNum === 1) {
      const archetypes = [
        () => ({
          question: `【過去簡單式不規則動詞與時間副詞】${preamble}\nI ________ a delicious cake for Mom's birthday yesterday, and she ________ very touched.`,
          options: [`bought; was`, `buyed; was`, `bought; were`, `buy; is`],
          answer: 0,
          hint: `💡 提示：yesterday 提示過去式；buy 的過去式為不規則變化 bought，主詞 she 搭配 was。`,
          explanation: `📖 詳解：yesterday 為過去時間副詞，動詞需用過去式：buy 不規則過去式為 bought；主詞 she 為單數第三人稱，過去式 Be 動詞用 was。`
        }),
        () => ({
          question: `【過去式否定與疑問句助動詞 did】${preamble}\n— "Did you ________ the movie last night?"\n— "No, I didn't. I ________ for my science test."`,
          options: [`watch; studied`, `watched; study`, `watch; study`, `watched; studied`],
          answer: 0,
          hint: `💡 提示：助動詞 Did 後面接原形動詞；答句過去式肯定句動詞轉為過去式 studied。`,
          explanation: `📖 詳解：疑問句助動詞 Did 後接原形動詞 watch；答句描述昨晚完成的動作，使用 study 的過去式 studied。`
        }),
        () => ({
          question: `【不規則動詞三態相同 AAA 型】${preamble}\nHe accidentally ________ his finger with a sharp knife while cooking dinner yesterday.`,
          options: [`cut`, `cutted`, `cuts`, `was cut`],
          answer: 0,
          hint: `💡 提示：cut 的過去式依然是 cut（cut-cut-cut）。`,
          explanation: `📖 詳解：動詞 cut 的過去式與原形相同（三態同型 AAA），過去式直接使用 cut，不可加 -ed。`
        }),
        () => ({
          question: `【不規則動詞 ABB 型 (bring, catch, teach)】${preamble}\nMs. Davis ________ us math last semester, and she ________ many fun games to class.`,
          options: [`taught; brought`, `teached; bringed`, `taught; bringed`, `teaches; brings`],
          answer: 0,
          hint: `💡 提示：teach 過去式為 taught；bring 過去式為 brought。`,
          explanation: `📖 詳解：teach 的過去式為 taught；bring 的過去式為 brought，皆屬 ABB 型不規則變化。`
        }),
        () => ({
          question: `【時間副詞 ago 的用法】${preamble}\nMy uncle moved to London three years ________, and we visited him last winter.`,
          options: [`ago`, `before`, `since`, `later`],
          answer: 0,
          hint: `💡 提示：一段時間 + ago 用於過去簡單式。`,
          explanation: `📖 詳解：three years ago（三年前）是過去簡單式常見的時間副詞片語，代表從現在算起的三年前。`
        }),
        () => ({
          question: `【過去進行式與過去簡單式連接詞 when / while】${preamble}\nWhen the earthquake struck, we ________ dinner in the dining room.`,
          options: [`were having`, `had`, `are having`, `have had`],
          answer: 0,
          hint: `💡 提示：地震發生的那一刻，我們「正在」吃晚餐（過去進行式 were having）。`,
          explanation: `📖 詳解：過去某個短暫動作發生時 (When struck)，另一個較長動作正在持續進行中，使用過去進行式 were having。`
        }),
        () => ({
          question: `【不規則動詞 ABA 型 (run, come, become)】${preamble}\nAs soon as the teacher entered, all the noisy students ________ back to their seats.`,
          options: [`ran`, `runned`, `run`, `were run`],
          answer: 0,
          hint: `💡 提示：run 的過去式為 ran。`,
          explanation: `📖 詳解：動詞 run 的過去式為不規則變化 ran。`
        }),
        () => ({
          question: `【過去簡單式 Be 動詞 was / were 辨析】${preamble}\nThere ________ a lot of people at the concert hall two hours ago.`,
          options: [`were`, `was`, `are`, `have been`],
          answer: 0,
          hint: `💡 提示：a lot of people 為複數名詞，過去式搭配 were。`,
          explanation: `📖 詳解：people 為複數名詞，two hours ago 為過去時間，過去式 be 動詞需用 were。`
        }),
        () => ({
          question: `【過去簡單式感嘆與狀態變化】${preamble}\nAlthough the test was challenging, everyone ________ satisfied with the final scores.`,
          options: [`felt`, `feeled`, `feels`, `was felt`],
          answer: 0,
          hint: `💡 提示：feel 的過去式為 felt。`,
          explanation: `📖 詳解：連綴動詞 feel 的過去式為不規則變化 felt。`
        }),
        () => ({
          question: `【動詞 lie / lay 過去式陷阱】${preamble}\nThe tired dog ________ down under the wooden bench and fell asleep immediately.`,
          options: [`lay`, `lied`, `laid`, `lain`],
          answer: 0,
          hint: `💡 提示：躺下 lie 的過去式為 lay；說謊 lie 過去式為 lied；放置 lay 過去式為 laid。`,
          explanation: `📖 詳解：lie（躺下）三態為 lie - lay - lain。此處指小狗在椅子下「躺下」，過去式為 lay。`
        }),
        () => ({
          question: `【過去時間引導詞 yesterday morning / last Sunday】${preamble}\nKevin ________ his keys on the kitchen counter yesterday morning and couldn't find them.`,
          options: [`left`, `leave`, `leaved`, `leaves`],
          answer: 0,
          hint: `💡 提示：leave 的過去式為 left。`,
          explanation: `📖 詳解：leave（落下、遺留）的過去式為不規則變化 left。`
        }),
        () => ({
          question: `【used to + 原形動詞 表過去習慣】${preamble}\nMr. Wang ________ live in the countryside, but he lives in a busy city now.`,
          options: [`used to`, `is used to`, `was used to`, `used`],
          answer: 0,
          hint: `💡 提示：used to + 原形動詞表示「過去曾經...（現在已不再）」之習慣或狀態。`,
          explanation: `📖 詳解：used to + 原形動詞 (live) 用以表達過去長期的習慣或狀態，與現在形成對比。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u2: 未來式 (will / be going to) 與天氣表達
    if (uNum === 2) {
      const archetypes = [
        () => ({
          question: `【未來式 will 與 be going to 句型】${preamble}\nLook at the dark clouds in the sky! It ________ rain soon.`,
          options: [`is going to`, `will be`, `is`, `rains`],
          answer: 0,
          hint: `💡 提示：有眼前的跡象提示即將發生某事時，優先使用 be going to。`,
          explanation: `📖 詳解：當依據眼前的客觀徵兆（如天空密布烏雲）預測即將發生之事時，最常使用 be going to + 原形動詞 (is going to rain)。`
        }),
        () => ({
          question: `【天氣形容詞與動詞句型轉換】${preamble}\nIt was ________ all day yesterday, so we didn't go hiking.`,
          options: [`rainy`, `raining`, `rained`, `rain`],
          answer: 0,
          hint: `💡 提示：Be 動詞 (was) 後面接形容詞 rainy 表天氣狀態。`,
          explanation: `📖 詳解：It was rainy (形容詞) = It rained (動詞)。was 後面接形容詞 rainy 描述昨天下雨的天氣狀況。`
        }),
        () => ({
          question: `【條件副詞子句與時間副詞子句的時態】${preamble}\nIf it ________ sunny tomorrow, we will go on a picnic by the lake.`,
          options: [`is`, `will be`, `was`, `has been`],
          answer: 0,
          hint: `💡 提示：在 if 或 when 引導的副詞子句中，用「現在簡單式代替未來式」。`,
          explanation: `📖 詳解：在條件副詞子句 (If) 與時間副詞子句 (When/Before/After) 中，即使主要子句為未來式 (will go)，子句中一律使用「現在簡單式代替未來式」 (is)。`
        }),
        () => ({
          question: `【will not 縮寫 won't 句型】${preamble}\nDon't worry about the presentation. I promise I ________ let you down.`,
          options: [`won't`, `will`, `don't`, `didn't`],
          answer: 0,
          hint: `💡 提示：I promise（我保證）引導未來的承諾，won't = will not。`,
          explanation: `📖 詳解：will not 縮寫為 won't，表「我保證不會讓你失望」。`
        }),
        () => ({
          question: `【詢問天氣的兩種核心句型】${preamble}\n— "________ the weather like today?"\n— "It's windy and cool."`,
          options: [`What is`, `How is`, `What does`, `How does`],
          answer: 0,
          hint: `💡 提示：詢問天氣有 like 時用 What is... like?；無 like 時用 How is...?`,
          explanation: `📖 詳解：天氣詢問公式：What is the weather like? = How is the weather?。題目末尾有介系詞 like，故前方需用 What is。`
        }),
        () => ({
          question: `【未來時間副詞標誌】${preamble}\nOur family ________ to Hualien for a three-day trip next weekend.`,
          options: [`will travel`, `traveled`, `travels`, `has traveled`],
          answer: 0,
          hint: `💡 提示：next weekend 為未來時間，使用 will travel。`,
          explanation: `📖 詳解：next weekend 為明確之未來時間副詞，動詞時態需用未來式 will travel 或 is going to travel。`
        }),
        () => ({
          question: `【降雪天氣的動名詞轉換】${preamble}\nThere was a lot of ________ in the high mountains last night.`,
          options: [`snow`, `snowy`, `snowing`, `snowed`],
          answer: 0,
          hint: `💡 提示：a lot of 後面接不可數名詞 snow。`,
          explanation: `📖 詳解：There was a lot of... 結構中，介系詞 of 後方需接名詞 snow（不可數名詞）。`
        }),
        () => ({
          question: `【未來式疑問句 Will you...?】${preamble}\n— "________ you be free this Saturday afternoon?"\n— "Yes, I will have no classes."`,
          options: [`Will`, `Do`, `Are`, `Did`],
          answer: 0,
          hint: `💡 提示：be free 為原形動詞片語，未來時間疑問句以 Will 開頭。`,
          explanation: `📖 詳解：以未來式助動詞 Will 開頭詢問：Will you be free this Saturday afternoon?。`
        }),
        () => ({
          question: `【颱風季節天氣警報情境】${preamble}\nThe typhoon is approaching rapidly. The wind ________ blow strongly tonight.`,
          options: [`will`, `did`, `is`, `has`],
          answer: 0,
          hint: `💡 提示：tonight 指今晚即將發生的未來，搭配 will + 原形 blow。`,
          explanation: `📖 詳解：tonight 預測今晚的未來風勢，使用助動詞 will + 原形動詞 blow。`
        }),
        () => ({
          question: `【be going to 疑問句的 be 動詞變化】${preamble}\n— "________ they going to join our study group tomorrow?"\n— "Yes, they are."`,
          options: [`Are`, `Will`, `Do`, `Is`],
          answer: 0,
          hint: `💡 提示：主詞 they 搭配複數 be 動詞 Are they going to...?`,
          explanation: `📖 詳解：be going to 句型中，主詞為 they，疑問句需將複數 be 動詞 Are 移至句首。`
        }),
        () => ({
          question: `【溫度度數與天氣表達】${preamble}\nThe temperature ________ drop below ten degrees Celsius tomorrow evening.`,
          options: [`will`, `is`, `does`, `has`],
          answer: 0,
          hint: `💡 提示：tomorrow evening 為未來時間，搭配 will + 原形動詞 drop。`,
          explanation: `📖 詳解：tomorrow evening 為明確未來式標誌，動詞 drop 前需加助動詞 will。`
        }),
        () => ({
          question: `【Sunny, Rainy, Windy 天氣形容詞並列】${preamble}\nIt is ________ and ________ today, perfect for flying a kite in the park.`,
          options: [`sunny; windy`, `sun; wind`, `sun; windy`, `sunny; wind`],
          answer: 0,
          hint: `💡 提示：It is 後接形容詞 sunny 與 windy。`,
          explanation: `📖 詳解：It is 後方接形容詞表氣候狀態：sunny（晴朗的）與 windy（有風的）。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u3: 比較級與最高級
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【形容詞比較級與 than 句型】${preamble}\nThis smartphone is much ________ than that one, but it is also ________.`,
          options: [`more expensive; better`, `most expensive; best`, `expensive; good`, `more expensive; more good`],
          answer: 0,
          hint: `💡 提示：than 提示比較級；much 可修飾比較級；good 的比較級為不規則的 better。`,
          explanation: `📖 詳解：句中有 than，形容詞需用比較級：expensive 比較級為 more expensive（可由 much 加強語氣）；good 的不規則比較級為 better。`
        }),
        () => ({
          question: `【最高級與範圍介系詞 of/in】${preamble}\nMount Everest is the ________ mountain ________ the world.`,
          options: [`highest; in`, `higher; of`, `highest; of`, `most high; in`],
          answer: 0,
          hint: `💡 提示：最高級前加 the (highest)；地方範圍用介系詞 in (in the world)。`,
          explanation: `📖 詳解：the + 最高級 (the highest)；表示在某個地點空間範圍內用介系詞 in the world（若為同類群體比較則用 of all）。`
        }),
        () => ({
          question: `【as... as 原級同等比較】${preamble}\nLeo runs as ________ as his coach, although he is only fifteen years old.`,
          options: [`fast`, `faster`, `fastest`, `more fast`],
          answer: 0,
          hint: `💡 提示：as... as 之間一律必須放「原級」形容詞或副詞。`,
          explanation: `📖 詳解：as + 原級形容詞/副詞 + as 為同等比較公式，fast 既可作形容詞亦可作副詞，原級為 fast。`
        }),
        () => ({
          question: `【副詞比較級與修飾語】${preamble}\nShe sings ________ than anyone else in our choir.`,
          options: [`more beautifully`, `beautifully`, `most beautifully`, `beautiful`],
          answer: 0,
          hint: `💡 提示：修飾動詞 sings 需用副詞 beautifully；句中有 than，比較級為 more beautifully。`,
          explanation: `📖 詳解：動詞 sings 需用副詞修飾，beautifully 的比較級為 more beautifully。`
        }),
        () => ({
          question: `【the + 比較級, the + 比較級 句型】${preamble}\nThe ________ you practice speaking English, the ________ it will become.`,
          options: [`more; easier`, `most; easiest`, `more; easily`, `much; easy`],
          answer: 0,
          hint: `💡 提示：The + 比較級..., the + 比較級... 表「越...就越...」。`,
          explanation: `📖 詳解：The + 比較級..., the + 比較級... 為英語經典對稱句型，意為「越常練習，說英語就會變得越容易 (easier)」。`
        }),
        () => ({
          question: `【不規則比較級 bad / badly -> worse -> worst】${preamble}\nThe weather today is even ________ than it was yesterday; it has been storming all day.`,
          options: [`worse`, `badder`, `worst`, `more bad`],
          answer: 0,
          hint: `💡 提示：bad 的比較級為不規則的 worse；even 可修飾比較級。`,
          explanation: `📖 詳解：bad 的比較級是不規則變化 worse，可由 even 加強語氣（甚至更糟糕）。`
        }),
        () => ({
          question: `【比較級修飾詞 much / far / a lot / a little】${preamble}\nThis laptop is ________ lighter than my old one; I can carry it easily in my backpack.`,
          options: [`much`, `very`, `too`, `so`],
          answer: 0,
          hint: `💡 提示：very, too, so 不能修飾比較級，修飾比較級需用 much / far / a lot。`,
          explanation: `📖 詳解：英文中修飾比較級 (lighter) 的程度副詞為 much, far, a lot, even, a little，不可使用 very 或 too。`
        }),
        () => ({
          question: `【最高級與 one of the + 最高級 + 複數名詞】${preamble}\nTaipei 101 is one of the ________ buildings in Asia.`,
          options: [`tallest`, `taller`, `most tall`, `tall`],
          answer: 0,
          hint: `💡 提示：one of the + 最高級 + 複數名詞「最...的之一」。`,
          explanation: `📖 詳解：one of the + 最高級 (tallest) + 複數名詞 (buildings) 為常見會考重點句型。`
        }),
        () => ({
          question: `【兩者之間的比較 the + 比較級 + of the two】${preamble}\nOf the two sisters, Emily is the ________ one.`,
          options: [`smarter`, `smartest`, `smart`, `more smart`],
          answer: 0,
          hint: `💡 提示：明確指「兩者之中」時，比較級前面必須加 the (the smarter of the two)。`,
          explanation: `📖 詳解：句型 of the two（兩者之中）有特指範圍，比較級前面必須加上定冠詞 the：the smarter of the two。`
        }),
        () => ({
          question: `【little -> less -> least 數量比較】${preamble}\nWe should spend ________ time playing video games and more time exercising outdoors.`,
          options: [`less`, `little`, `least`, `fewer`],
          answer: 0,
          hint: `💡 提示：time 為不可數名詞，比較級用 less（與 more 平行對比）。`,
          explanation: `📖 詳解：不可數名詞 time 的少用 little，比較級為 less，與後半句的 more time 形成對比。`
        }),
        () => ({
          question: `【few -> fewer -> fewest 可數名詞比較】${preamble}\nThere were ________ mistakes in Mark's composition today than yesterday.`,
          options: [`fewer`, `less`, `fewest`, `little`],
          answer: 0,
          hint: `💡 提示：mistakes 為複數可數名詞，比較級用 fewer。`,
          explanation: `📖 詳解：可數複數名詞 (mistakes) 的較少需用 fewer；less 是修飾不可數名詞。`
        }),
        () => ({
          question: `【副詞最高級前 the 可省略】${preamble}\nAmong all the students, Daniel answered the questions ________.`,
          options: [`most correctly`, `more correctly`, `correctest`, `correctlier`],
          answer: 0,
          hint: `💡 提示：修飾動詞 answered 需用副詞最高級 (the) most correctly。`,
          explanation: `📖 詳解：副詞 correctly 的最高級為 most correctly，用以修飾動詞 answered。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u4: 不定詞 (to V) 與動名詞 (V-ing)
    if (uNum === 4) {
      const archetypes = [
        () => ({
          question: `【接動名詞 vs 不定詞的動詞搭配】${preamble}\nMy sister enjoys ________ novels, and she hopes ________ a famous writer in the future.`,
          options: [`reading; to become`, `to read; becoming`, `reading; becoming`, `to read; to become`],
          answer: 0,
          hint: `💡 提示：enjoy 後接動名詞 V-ing；hope 後接不定詞 to V。`,
          explanation: `📖 詳解：enjoy / practice / finish / avoid 等動詞後接動名詞 V-ing (reading)；hope / plan / decide / want 等動詞後接不定詞 to V (to become)。`
        }),
        () => ({
          question: `【stop to V 與 stop V-ing 語意差異】${preamble}\nAfter studying for four hours straight, Leo stopped ________ a cup of coffee to refresh his mind.`,
          options: [`to drink`, `drinking`, `drank`, `drinks`],
          answer: 0,
          hint: `💡 提示：stop to V 是停下手邊事情去進行另一件事；stop V-ing 是停止進行中的動作。`,
          explanation: `📖 詳解：stop to drink 指停下正在念書的動作「去喝」一杯咖啡；若用 stop drinking 則是「戒除、停止喝咖啡」之意。`
        }),
        () => ({
          question: `【動名詞當主詞視為單數】${preamble}\n________ regular exercise and eating healthy food ________ good for our bodies.`,
          options: [`Getting; is`, `Get; are`, `Getting; are`, `To get; are`],
          answer: 0,
          hint: `💡 提示：動名詞短語當主詞，視為單數概念，be動詞用 is。`,
          explanation: `📖 詳解：動名詞片語 (Getting regular exercise...) 作為單一件事的主詞時，動詞需用單數 is。`
        }),
        () => ({
          question: `【remember to V vs remember V-ing】${preamble}\nPlease remember ________ the front door when you leave the house.`,
          options: [`to lock`, `locking`, `locked`, `locks`],
          answer: 0,
          hint: `💡 提示：remember to V 指「記得要去作某件事（尚未作）」；remember V-ing 是「記得曾經作過某事」。`,
          explanation: `📖 詳解：出門時記得「要去鎖門」，動作尚未發生，需用不定詞 to lock。`
        }),
        () => ({
          question: `【forget to V vs forget V-ing】${preamble}\nI will never forget ________ the breathtaking sunrise on Mount Ali with my parents.`,
          options: [`seeing`, `to see`, `saw`, `seen`],
          answer: 0,
          hint: `💡 提示：never forget V-ing 指「永難忘懷曾經經歷過的某事」。`,
          explanation: `📖 詳解：看阿里山日出是已經發生過的珍貴回憶，搭配動名詞 seeing，表示永遠不會忘記曾經看過日出的情景。`
        }),
        () => ({
          question: `【介系詞後接動名詞 V-ing】${preamble}\nSam is very interested in ________ robotics and artificial intelligence.`,
          options: [`learning`, `to learn`, `learn`, `learned`],
          answer: 0,
          hint: `💡 提示：介系詞 (in, at, about, for) 後面的動詞一律必須改為動名詞 V-ing。`,
          explanation: `📖 詳解：be interested in 介系詞 in 後面接動詞時，必須使用動名詞形式 learning。`
        }),
        () => ({
          question: `【花費動詞 spend + V-ing】${preamble}\nChloe spent three hours ________ that difficult 1000-piece puzzle.`,
          options: [`completing`, `to complete`, `completed`, `complete`],
          answer: 0,
          hint: `💡 提示：人 + spend + 時間/金錢 + (in) V-ing。`,
          explanation: `📖 詳解：主詞為人時，spend + 時間 + V-ing 為固定句型，故使用 completing。`
        }),
        () => ({
          question: `【虛主詞 It is + adj. + for sb to V 句型】${preamble}\nIt is essential for junior high students ________ enough sleep every night.`,
          options: [`to get`, `getting`, `get`, `got`],
          answer: 0,
          hint: `💡 提示：It is + 形容詞 + for sb + to V，It 為虛主詞，真正主詞為後方不定詞。`,
          explanation: `📖 詳解：It 作為虛主詞代指後方真正的不定詞片語 (to get enough sleep every night)。`
        }),
        () => ({
          question: `【practice 後接動名詞 V-ing】${preamble}\nIf you want to play in the school band, you must practice ________ the flute daily.`,
          options: [`playing`, `to play`, `play`, `played`],
          answer: 0,
          hint: `💡 提示：practice 後面固定接動名詞 V-ing。`,
          explanation: `📖 詳解：動詞 practice（練習）後面受詞一律接動名詞 playing。`
        }),
        () => ({
          question: `【decide 後接不定詞 to V】${preamble}\nAfter a long discussion, the team decided ________ the project next Monday.`,
          options: [`to start`, `starting`, `start`, `started`],
          answer: 0,
          hint: `💡 提示：decide（決定）後面固定接不定詞 to V。`,
          explanation: `📖 詳解：decide / choose / plan 後面接不定詞 to V (to start) 作受詞。`
        }),
        () => ({
          question: `【look forward to + V-ing 陷阱題】${preamble}\nAll the children are looking forward to ________ the new amusement park.`,
          options: [`visiting`, `visit`, `visited`, `to visit`],
          answer: 0,
          hint: `💡 提示：look forward to 中的 to 是「介系詞」，後面必須接動名詞 V-ing！`,
          explanation: `📖 詳解：look forward to（期待）中的 to 是介系詞而非不定詞，後接動詞時必須使用動名詞 visiting。`
        }),
        () => ({
          question: `【How about / What about + V-ing 提議句型】${preamble}\nHow about ________ to the beach and having an ice cream this afternoon?`,
          options: [`going`, `to go`, `go`, `went`],
          answer: 0,
          hint: `💡 提示：How about / What about 後接動名詞 V-ing 表提議。`,
          explanation: `📖 詳解：about 為介系詞，How about + V-ing (going) 用於提出建議。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u5: 使役動詞與感官動詞
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【使役動詞 make / let / have 接原形動詞】${preamble}\nThe teacher made all the students ________ the classroom before they left.`,
          options: [`clean`, `to clean`, `cleaned`, `cleaning`],
          answer: 0,
          hint: `💡 提示：使役動詞 make / have / let 受詞後接「原形動詞」。`,
          explanation: `📖 詳解：使役動詞 (made) 後接受詞 (all the students)，主動語態下一律接原形動詞 clean。`
        }),
        () => ({
          question: `【感官動詞 see / hear / watch 句型】${preamble}\nI heard someone ________ the piano upstairs when I walked into the hall.`,
          options: [`playing`, `to play`, `played`, `plays`],
          answer: 0,
          hint: `💡 提示：感官動詞後接原形動詞（強調事實）或 V-ing（強調當下正在進行）。`,
          explanation: `📖 詳解：感官動詞 hear 後接受詞，受詞主動進行動作時可接原形動詞或動名詞 V-ing (playing)，表示走進大廳時正好聽見正有人在彈奏鋼琴。`
        }),
        () => ({
          question: `【使役動詞被動語態還原 to】${preamble}\nThe soldiers were made ________ twenty kilometers with heavy gear.`,
          options: [`to march`, `march`, `marching`, `marched`],
          answer: 0,
          hint: `💡 提示：使役動詞 make 在被動語態 (be made) 後面必須「還原 to」！`,
          explanation: `📖 詳解：make 主動接原形動詞，但轉為被動語態 (were made) 時，後方的不定詞符號 to 必須還原 (were made to march)。`
        }),
        () => ({
          question: `【help 的受詞補語用法】${preamble}\nCan you please help me ________ this heavy wooden bookshelf?`,
          options: [`move`, `moving`, `moved`, `to moving`],
          answer: 0,
          hint: `💡 提示：help + O + (to) V，可接原形動詞或帶 to 的不定詞。`,
          explanation: `📖 詳解：help 作為使役用法，其後可接原形動詞或 to + V，選項中 move 最為合適。`
        }),
        () => ({
          question: `【get 作為使役動詞接 to V】${preamble}\nDad finally got the plumber ________ the leaking pipe in the bathroom.`,
          options: [`to fix`, `fix`, `fixing`, `fixed`],
          answer: 0,
          hint: `💡 提示：get 表使役「說服、促使某人作某事」時，受詞後接 to V。`,
          explanation: `📖 詳解：get sb to do sth 為固定使役句型，表示說服或使某人做某事，後接帶 to 的不定詞 to fix。`
        }),
        () => ({
          question: `【感官動詞強調動作全程用原形】${preamble}\nWe watched the sun ________ over the horizon until it completely disappeared.`,
          options: [`sink`, `to sink`, `sinking`, `sunk`],
          answer: 0,
          hint: `💡 提示：感官動詞 watch 後接原形動詞 sink，強調目睹整個下沉過程。`,
          explanation: `📖 詳解：watch 後接原形動詞強調目睹動作發生的完整過程（全程直到消失）。`
        }),
        () => ({
          question: `【使役動詞 let 的否定用法】${preamble}\nMom didn't let my little brother ________ out after nine o'clock.`,
          options: [`stay`, `to stay`, `staying`, `stayed`],
          answer: 0,
          hint: `💡 提示：let + O + 原形動詞 stay。`,
          explanation: `📖 詳解：let 為使役動詞，後方的受詞補語一律使用原形動詞 stay。`
        }),
        () => ({
          question: `【感官動詞 notice 句型】${preamble}\nDid you notice a stranger ________ around our neighborhood this morning?`,
          options: [`wandering`, `to wander`, `wandered`, `wanders`],
          answer: 0,
          hint: `💡 提示：notice 感官動詞，看到正在徘徊用 wandering。`,
          explanation: `📖 詳解：notice（注意到）為感官動詞，表示注意到某人正在徘徊，接動名詞 wandering。`
        }),
        () => ({
          question: `【使役動詞 have + O + p.p. 被動用法】${preamble}\nI need to have my broken computer ________ by a technician as soon as possible.`,
          options: [`repaired`, `repair`, `to repair`, `repairing`],
          answer: 0,
          hint: `💡 提示：電腦是被修理，have + 物 + p.p. 表被動使役。`,
          explanation: `📖 詳解：have + 受詞 + p.p. 表示「使某物被處理」，電腦與修理為被動關係，用過去分詞 repaired。`
        }),
        () => ({
          question: `【feel + O + 原形 / V-ing】${preamble}\nDuring the tremor, we felt the entire building ________ violently.`,
          options: [`shake`, `to shake`, `shook`, `shaken`],
          answer: 0,
          hint: `💡 提示：feel 為感官動詞，後接原形動詞 shake。`,
          explanation: `📖 詳解：feel（感覺到）為感官動詞，受詞 the entire building 後接原形動詞 shake 或 shaking。`
        }),
        () => ({
          question: `【使役動詞 make 促使某人產生情緒】${preamble}\nThe heartwarming movie made everyone in the theater ________ tears.`,
          options: [`shed`, `to shed`, `shedding`, `shedded`],
          answer: 0,
          hint: `💡 提示：make + O + 原形動詞 shed (shed-shed-shed 流淚)。`,
          explanation: `📖 詳解：make 使役動詞接原形動詞 shed tears（落淚）。`
        }),
        () => ({
          question: `【listen to 感官動詞片語】${preamble}\nSit quietly and listen to the rain ________ against the window pane.`,
          options: [`tapping`, `to tap`, `tapped`, `taps`],
          answer: 0,
          hint: `💡 提示：listen to 為感官動詞片語，接 V-ing 表正在敲打。`,
          explanation: `📖 詳解：listen to 後接 V-ing (tapping)，生動描述雨滴正不斷敲打著窗戶。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }
  }

  // ============================================================
  // 國三 (九年級)
  // ============================================================
  if (gradeId === 'g9') {
    // u1: 現在完成式 (have/has + p.p.)
    if (uNum === 1) {
      const archetypes = [
        () => ({
          question: `【現在完成式與 since / for 時間副詞】${preamble}\nMr. Lin ________ in this school ________ more than twenty years.`,
          options: [`has taught; for`, `taught; since`, `has taught; since`, `teaches; for`],
          answer: 0,
          hint: `💡 提示：一段持續的時間（20年）搭配 for；完成式用 has + p.p. (has taught)。`,
          explanation: `📖 詳解：主詞 Mr. Lin 為單數，現在完成式為 has + p.p. (has taught)；一段長度的時間 (more than twenty years) 介系詞需用 for（若接過去某個時間起點則用 since）。`
        }),
        () => ({
          question: `【have been to vs have gone to 區分】${preamble}\n— "Where is Judy? I haven't seen her all morning."\n— "She ________ Japan for a vacation. She won't be back until next Monday."`,
          options: [`has gone to`, `has been to`, `went to`, `had been to`],
          answer: 0,
          hint: `💡 提示：has gone to 代表人「已經去了（尚未回來）」；has been to 代表「曾經去過（已回到原處）」。`,
          explanation: `📖 詳解：答句提到「下週一才會回來」，代表她人目前已經前往日本、不在現場，需用 has gone to。has been to 是指「去過某地且已返回」。`
        }),
        () => ({
          question: `【already 與 yet 在完成式中】${preamble}\n— "Have you finished the lab report ________?"\n— "Yes, I have ________ submitted it."`,
          options: [`yet; already`, `already; yet`, `since; for`, `ever; never`],
          answer: 0,
          hint: `💡 提示：yet 用於完成式否定句與疑問句句尾；already 用於完成式肯定句。`,
          explanation: `📖 詳解：yet 常放在完成式疑問句或否定句末尾；already 放在肯定句 have/has 與 p.p. 之間。`
        }),
        () => ({
          question: `【ever 與 never 表經驗】${preamble}\nHave you ________ eaten stinky tofu before? No, I have ________ tried it.`,
          options: [`ever; never`, `never; ever`, `already; yet`, `since; yet`],
          answer: 0,
          hint: `💡 提示：ever 用於疑問句詢問「是否曾經」；never 用於否定表達「從未」。`,
          explanation: `📖 詳解：詢問生活經驗時使用 ever（曾經）；否定答句使用 never（從未）。`
        }),
        () => ({
          question: `【since + 過去簡單式子句】${preamble}\nWe have been close friends ever since we ________ each other in kindergarten.`,
          options: [`met`, `have met`, `meet`, `had met`],
          answer: 0,
          hint: `💡 提示：since 引導的副詞子句中，動詞需用「過去簡單式」met。`,
          explanation: `📖 詳解：主要子句使用現在完成式 (have been)，since 引導表示時間起點的子句，動詞必須使用過去簡單式 met。`
        }),
        () => ({
          question: `【so far / in recent years 完成式標誌】${preamble}\nScientists ________ many new species of deep-sea creatures in recent years.`,
          options: [`have discovered`, `discovered`, `discover`, `are discovering`],
          answer: 0,
          hint: `💡 提示：in recent years（近年來）表示持續到現在的影響，需用現在完成式。`,
          explanation: `📖 詳解：in recent years 與 so far 為現在完成式之代表時間副詞，主詞為複數，用 have discovered。`
        }),
        () => ({
          question: `【完成式非延續性動詞陷阱】${preamble}\nGrandfather ________ for five years, but we still miss him deeply.`,
          options: [`has been dead`, `has died`, `died`, `is dying`],
          answer: 0,
          hint: `💡 提示：die 為瞬間動詞不能接一段時間 for five years，持續狀態需用 has been dead。`,
          explanation: `📖 詳解：die 為瞬間點動詞，不能接 for five years 延續；表示過世已持續五年，需用形容詞狀態 has been dead（或用 died five years ago）。`
        }),
        () => ({
          question: `【How long 完成式問句】${preamble}\n— "________ have you learned to play the violin?"\n— "For about six years."`,
          options: [`How long`, `How often`, `How many`, `When`],
          answer: 0,
          hint: `💡 提示：回答一段時間 (For about six years)，詢問時間長度用 How long。`,
          explanation: `📖 詳解：How long 用以詢問持續時間的長度，常與現在完成式連用。`
        }),
        () => ({
          question: `【完成式與 just 剛才】${preamble}\nBe careful! The paint on the bench is wet because I have just ________ it.`,
          options: [`painted`, `paint`, `painting`, `paints`],
          answer: 0,
          hint: `💡 提示：have just + p.p. painted。`,
          explanation: `📖 詳解：have + just + p.p. 表示「剛剛才完成」某動作。`
        }),
        () => ({
          question: `【次數副詞與完成式結合】${preamble}\nThis is the third time that she ________ the national speech competition.`,
          options: [`has won`, `won`, `wins`, `is winning`],
          answer: 0,
          hint: `💡 提示：This is the + 序數 + time that + S + 現在完成式。`,
          explanation: `📖 詳解：This is the first / second / third time 句型後面習慣搭配現在完成式 has won。`
        }),
        () => ({
          question: `【It has been + 時間 + since 句型】${preamble}\nIt ________ three years since we graduated from elementary school.`,
          options: [`has been`, `was`, `is being`, `will be`],
          answer: 0,
          hint: `💡 提示：It has been (或 It is) + 一段時間 + since + 過去式子句。`,
          explanation: `📖 詳解：It has been + 時間長度 + since... 表示「自從...以來已經過了多久時間」。`
        }),
        () => ({
          question: `【have had 完成式不規則三態】${preamble}\nI ________ this bicycle since I was twelve, and it still works smoothly.`,
          options: [`have had`, `have`, `had`, `have been had`],
          answer: 0,
          hint: `💡 提示：have 的過去分詞為 had，現在完成式為 have had。`,
          explanation: `📖 詳解：自12歲起擁有至今，have 的現在完成式為 have had。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u2: 被動語態 (be + p.p.)
    if (uNum === 2) {
      const archetypes = [
        () => ({
          question: `【被動語態時態與介系詞 by】${preamble}\nThe novel ________ by the author in 1995, and it ________ into over twenty languages so far.`,
          options: [
            `was written; has been translated`,
            `wrote; translated`,
            `is written; was translated`,
            `has written; is translated`
          ],
          answer: 0,
          hint: `💡 提示：in 1995 是過去特定年份用過去被動 was written；so far 是到目前為止用現在完成被動 has been translated。`,
          explanation: `📖 詳解：第一格有明確過去年份 in 1995，用過去被動 was written；第二格有完成式指標 so far（到目前為止），用現在完成被動態 has been translated。`
        }),
        () => ({
          question: `【含有情態助動詞的被動語態】${preamble}\nAll the rules must ________ strictly by everyone in the laboratory.`,
          options: [`be followed`, `follow`, `been followed`, `following`],
          answer: 0,
          hint: `💡 提示：情態助動詞被動句型：must + be + p.p.`,
          explanation: `📖 詳解：含有助動詞的被動語態公式為：情態助動詞 (must) + be 原形 + 動詞過去分詞 (followed)。`
        }),
        () => ({
          question: `【未來式被動語態 will be + p.p.】${preamble}\nThe new cross-sea bridge ________ by the construction company next year.`,
          options: [`will be built`, `will build`, `is built`, `was built`],
          answer: 0,
          hint: `💡 提示：next year 提示未來式，橋是被建造，需用 will be built。`,
          explanation: `📖 詳解：未來式被動語態公式為 will be + p.p. (will be built)。`
        }),
        () => ({
          question: `【特殊介系詞被動語態 be covered with / be made of】${preamble}\nThe peak of Mount Jade is ________ thick snow during winter.`,
          options: [`covered with`, `covered by`, `covered of`, `covered in`],
          answer: 0,
          hint: `💡 提示：被...所覆蓋，固定介系詞搭配為 be covered with。`,
          explanation: `📖 詳解：被動語態中並非所有動詞都接 by，be covered with（被...覆蓋）為固定慣用介系詞搭配。`
        }),
        () => ({
          question: `【be made of 與 be made from 的區分】${preamble}\nThis dining table is ________ oak wood, while paper is ________ wood pulp.`,
          options: [`made of; made from`, `made from; made of`, `made by; made in`, `made of; made by`],
          answer: 0,
          hint: `💡 提示：看得出原材料之物理變化用 made of；看不出原材料之化學變化用 made from。`,
          explanation: `📖 詳解：木桌看得出木材質地，屬物理變化用 be made of；紙張已經看不出木材原貌，屬化學變化用 be made from。`
        }),
        () => ({
          question: `【疑問句被動語態 Where was it made?】${preamble}\n— "Where ________ these delicate porcelain cups ________?"\n— "In Yingge, Taiwan."`,
          options: [`were; made`, `are; making`, `did; make`, `have; made`],
          answer: 0,
          hint: `💡 提示：cups 為複數，杯子是被製造，過去被動用 were these cups made。`,
          explanation: `📖 詳解：porcelain cups 是被製造出來的物品，疑問句被動結構為 Where were these cups made?。`
        }),
        () => ({
          question: `【現在進行式被動 is/are being + p.p.】${preamble}\nPlease be patient; your vehicle ________ in the garage right now.`,
          options: [`is being repaired`, `is repairing`, `has repaired`, `was repaired`],
          answer: 0,
          hint: `💡 提示：right now 提示正在進行，車子是被修理，需用 is being repaired。`,
          explanation: `📖 詳解：現在進行式被動語態公式為 is/are + being + p.p. (is being repaired)。`
        }),
        () => ({
          question: `【雙賓動詞轉被動語態】${preamble}\nA meaningful souvenir was given ________ Mark by his best friend.`,
          options: [`to`, `for`, `at`, `with`],
          answer: 0,
          hint: `💡 提示：give 轉被動以物為主詞時，人前面接介系詞 to (give sth to sb)。`,
          explanation: `📖 詳解：雙賓動詞 give 轉為被動語態時，原間接受詞（人）前需補上介系詞 to：Sth is given to sb。`
        }),
        () => ({
          question: `【buy 轉被動的介系詞 for】${preamble}\nThis lovely birthday gift was bought ________ me by my aunt.`,
          options: [`for`, `to`, `with`, `of`],
          answer: 0,
          hint: `💡 提示：buy 為買給某人，轉被動時介系詞搭配 for (bought for me)。`,
          explanation: `📖 詳解：buy 的雙賓結構為 buy sth for sb，轉為被動語態時接介系詞 for。`
        }),
        () => ({
          question: `【不及物動詞無被動語態陷阱 (happen / occur)】${preamble}\nA severe car accident ________ at the busy intersection yesterday afternoon.`,
          options: [`happened`, `was happened`, `is happened`, `has happened`],
          answer: 0,
          hint: `💡 提示：happen, occur（發生）為不及物動詞，絕對「沒有被動語態」！`,
          explanation: `📖 詳解：happen（發生）為不及物動詞，主語為事件本身，不可使用 was happened，直接用過去式 happened。`
        }),
        () => ({
          question: `【be known to / for / as 介系詞辨析】${preamble}\nTainan is well known ________ its rich historical sites and traditional snacks.`,
          options: [`for`, `to`, `as`, `by`],
          answer: 0,
          hint: `💡 提示：以某項特徵或產物聞名用 be known for；作為某種身分聞名用 be known as。`,
          explanation: `📖 詳解：be known for 表示「以...聞名/著名」；be known to 是「為某人所知」；be known as 是「以某身分著名」。`
        }),
        () => ({
          question: `【被動語態與大眾傳播報導】${preamble}\nIt ________ that the legendary rock band will hold a world tour next year.`,
          options: [`is reported`, `reports`, `is reporting`, `has reported`],
          answer: 0,
          hint: `💡 提示：It is reported that...「據報導...」為虛主詞被動常用句型。`,
          explanation: `📖 詳解：It is reported that... 為固定新聞與客觀報導被動句型，意為「據報導指出...」。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u3: 關係代名詞與關係子句
    if (uNum === 3) {
      const archetypes = [
        () => ({
          question: `【關係代名詞主格 who / which / that】${preamble}\nThe woman ________ lives next door is a doctor ________ works at the city hospital.`,
          options: [`who; who`, `which; which`, `whose; who`, `who; which`],
          answer: 0,
          hint: `💡 提示：先行詞為人 (the woman / a doctor)，在關係子句中作主詞，用 who 或 that。`,
          explanation: `📖 詳解：先行詞 the woman 與 a doctor 皆為人，在後方形容詞子句中作動詞 (lives / works) 的主詞，關係代名詞需用 who 或 that。`
        }),
        () => ({
          question: `【關係代名詞所有格 whose】${preamble}\nI met a boy ________ father is a pilot for an international airline.`,
          options: [`whose`, `who`, `whom`, `which`],
          answer: 0,
          hint: `💡 提示：先行詞 a boy 與名詞 father 之間為所有格關係（男孩的父親），用 whose。`,
          explanation: `📖 詳解：whose 為關係代名詞所有格，修飾後方的名詞 father，代表「他的父親是一位機師」。`
        }),
        () => ({
          question: `【先行詞為物時使用 which / that】${preamble}\nThe smartphone ________ I bought yesterday has a wonderful camera.`,
          options: [`which`, `who`, `whom`, `whose`],
          answer: 0,
          hint: `💡 提示：先行詞 the smartphone 為物，關係代名詞用 which 或 that。`,
          explanation: `📖 詳解：先行詞是事物 (the smartphone)，關係子句中作 bought 的受詞，使用 which 或 that。`
        }),
        () => ({
          question: `【關係代名詞當受格時可省略】${preamble}\nThe book ________ you lent me last week is extremely fascinating.`,
          options: [`(that)`, `who`, `whose`, `what`],
          answer: 0,
          hint: `💡 提示：關代在子句中作受格時可以完全省略。`,
          explanation: `📖 詳解：先行詞 the book 在子句 you lent me (book) 中擔任動詞的受格，關係代名詞 that 或 which 可直接省略。`
        }),
        () => ({
          question: `【只能用 that 的特殊先行詞 (the only / the very / 最高級)】${preamble}\nThis is the most impressive documentary ________ I have ever watched.`,
          options: [`that`, `which`, `what`, `who`],
          answer: 0,
          hint: `💡 提示：先行詞有形容詞最高級 (the most impressive) 修飾時，關代只能用 that！`,
          explanation: `📖 詳解：當先行詞受到最高級、the only, the very, all, no, any 等限定詞修飾時，關係代名詞習慣優先使用 that，不用 which。`
        }),
        () => ({
          question: `【先行詞同時包含「人與動物/物」時用 that】${preamble}\nThe old man and his faithful dog ________ were crossing the street got hit by a bicycle.`,
          options: [`that`, `who`, `which`, `whom`],
          answer: 0,
          hint: `💡 提示：先行詞同時有人 (the old man) 與物/動物 (his dog) 時，只能使用 that。`,
          explanation: `📖 詳解：先行詞若同時兼具「人」與「動物」，無法單純使用 who 或 which，必須統一使用 that。`
        }),
        () => ({
          question: `【介系詞 + 關係代名詞 (whom / which)】${preamble}\nThe brave girl with ________ I shared the umbrella is my sister's classmate.`,
          options: [`whom`, `who`, `that`, `which`],
          answer: 0,
          hint: `💡 提示：介系詞 (with) 後面直接接關代時，指人只能用受格 whom，絕不能用 that 或 who。`,
          explanation: `📖 詳解：介系詞前置 (with) 時，先行詞為人，關係代名詞只能使用受格 whom，不得使用 who 或 that。`
        }),
        () => ({
          question: `【關係代名詞 what 複合關代（= the thing which）】${preamble}\nI couldn't believe ________ he said at the meeting; it was completely shocking.`,
          options: [`what`, `that`, `which`, `who`],
          answer: 0,
          hint: `💡 提示：what = the thing that，前面「沒有先行詞」，本身包含先行詞與關代。`,
          explanation: `📖 詳解：what 為複合關係代名詞，等於 the thing which/that，前方不可有先行詞，引導名詞子句作 believe 的受詞。`
        }),
        () => ({
          question: `【先行詞為物的所有格 whose / of which】${preamble}\nLook at that tall building ________ roof is shaped like a giant lotus flower.`,
          options: [`whose`, `which`, `that`, `who`],
          answer: 0,
          hint: `💡 提示：whose 也可用於指「物」的所有格（那棟大樓的屋頂）。`,
          explanation: `📖 詳解：關係代名詞所有格 whose 不僅可用於人，亦廣泛用於事物的所有格 (that building whose roof...)。`
        }),
        () => ({
          question: `【非限定關係子句逗號後不可用 that】${preamble}\nMy father, ________ travels abroad frequently, brought me a Swiss watch.`,
          options: [`who`, `that`, `which`, `whom`],
          answer: 0,
          hint: `💡 提示：逗號後面的非限定關係子句中，絕對「不可使用 that」！`,
          explanation: `📖 詳解：非限定關係子句（有逗號）中，關代指人必須使用 who，絕對不可使用 that。`
        }),
        () => ({
          question: `【關係代名詞當主格時之動詞單複數一致性】${preamble}\nThe students who ________ top scores on the exam will receive scholarships.`,
          options: [`earn`, `earns`, `earning`, `earned to`],
          answer: 0,
          hint: `💡 提示：先行詞 the students 為複數，關係子句動詞需用複數 earn。`,
          explanation: `📖 詳解：關係代名詞 who 所代表的先行詞是複數 the students，故關係子句內的動詞需搭配複數形 earn。`
        }),
        () => ({
          question: `【Those who... 凡是...的人們】${preamble}\nThose ________ work hard every day will eventually achieve their dreams.`,
          options: [`who`, `which`, `whose`, `whom`],
          answer: 0,
          hint: `💡 提示：Those who... 為重要固定片語，意為「凡是...的人」。`,
          explanation: `📖 詳解：Those who + 複數動詞為固定經典句型，指「凡是...的人們」。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u4: 名詞子句與間接問句
    if (uNum === 4) {
      const archetypes = [
        () => ({
          question: `【間接問句主謂倒裝還原】${preamble}\nExcuse me, could you please tell me ________?`,
          options: [
            `where the nearest subway station is`,
            `where is the nearest subway station`,
            `where the nearest subway station was`,
            `how can I get to the subway station`
          ],
          answer: 0,
          hint: `💡 提示：間接問句語序為「疑問詞 + 主詞 + 動詞」（不可倒裝）。`,
          explanation: `📖 詳解：間接問句作為名詞子句當受詞時，語序必須恢復平述句順序：疑問詞 (where) + 主詞 (the station) + 動詞 (is)。不可採疑問倒裝 where is the station。`
        }),
        () => ({
          question: `【whether / if 引導的名詞子句】${preamble}\nI am not sure ________ it will rain tomorrow or not.`,
          options: [`whether`, `that`, `what`, `which`],
          answer: 0,
          hint: `💡 提示：whether ... or not 代表「是否」，表達不確定性的疑問語氣。`,
          explanation: `📖 詳解：表示「是否」的名詞子句，特別是後方搭配 or not 時，習慣使用 whether 引導。`
        }),
        () => ({
          question: `【that 引導名詞子句當受詞可省略】${preamble}\nWe all know ________ honesty is always the best policy.`,
          options: [`(that)`, `what`, `which`, `where`],
          answer: 0,
          hint: `💡 提示：that 引導陳述事實的名詞子句當受詞，that 本身無實義且可省略。`,
          explanation: `📖 詳解：that 引導名詞子句作為動詞 know 的受詞，句子結構完整陳述事實，that 可以被省略。`
        }),
        () => ({
          question: `【間接問句之助動詞 do/does/did 還原】${preamble}\nDo you know what time ________ every day?`,
          options: [`the train departs`, `does the train depart`, `is the train departing`, `departed the train`],
          answer: 0,
          hint: `💡 提示：間接問句中不可保留助動詞 does，需直接將動詞轉為第三人稱單數 departs。`,
          explanation: `📖 詳解：直接問句為 What time does the train depart?，轉為間接問句時去除助動詞 does，動詞恢復單數第三人稱 departs。`
        }),
        () => ({
          question: `【疑問詞兼主詞時語序不變】${preamble}\nNobody in the classroom knows who ________ the window.`,
          options: [`broke`, `did break`, `broken`, `is breaking`],
          answer: 0,
          hint: `💡 提示：當疑問詞 who 本身即為子句主詞時，後方直接接動詞 (broke)。`,
          explanation: `📖 詳解：who 在間接問句中本身充當主詞，因此語序直接接動詞 broke，不需要也不可以倒裝。`
        }),
        () => ({
          question: `【whether or not 位置陷阱】${preamble}\nMy parents asked me ________ I wanted to study music in Vienna.`,
          options: [`whether`, `that`, `what`, `which`],
          answer: 0,
          hint: `💡 提示：whether 引導名詞子句表示「是否想去維也納學音樂」。`,
          explanation: `📖 詳解：asked me 後方接表示「是否」的間接問句，使用 whether 或 if 引導。`
        }),
        () => ({
          question: `【間接問句時態呼應】${preamble}\nJenny wondered why Tom ________ at the party yesterday.`,
          options: [`wasn't`, `isn't`, `won't be`, `doesn't`],
          answer: 0,
          hint: `💡 提示：主要子句 wondered 與時間副詞 yesterday 均為過去式，子句動詞用過去式 wasn't。`,
          explanation: `📖 詳解：主要子句動詞 wondered 為過去式，且事件發生於 yesterday，間接問句內需時態一致用 wasn't。`
        }),
        () => ({
          question: `【疑問詞 + to V 縮減名詞片語】${preamble}\nI have so many options that I really don't know ________.`,
          options: [`what to choose`, `what should choose`, `how to choose it`, `which choose`],
          answer: 0,
          hint: `💡 提示：疑問詞 + to V 可精簡替代名詞子句 (what I should choose = what to choose)。`,
          explanation: `📖 詳解：what to choose 為「疑問詞 + 不定詞」結構，等同於 what I should choose，作為動詞 know 的受詞。`
        }),
        () => ({
          question: `【how much / how many 在間接問句中】${preamble}\nPlease let me know how much ________ for this new laptop.`,
          options: [`you paid`, `did you pay`, `you pay`, `were you paid`],
          answer: 0,
          hint: `💡 提示：間接問句恢復平述語序：you paid。`,
          explanation: `📖 詳解：how much 為疑問片語，後接主詞 you + 過去式動詞 paid，不可使用疑問句倒裝 did you pay。`
        }),
        () => ({
          question: `【名詞子句當主詞視為單數】${preamble}\nThat global warming is getting worse ________ an indisputable scientific fact.`,
          options: [`is`, `are`, `be`, `being`],
          answer: 0,
          hint: `💡 提示：that 引導的名詞子句作為全句主詞時，動詞一律視為單數 is。`,
          explanation: `📖 詳解：That 引導名詞子句當整體主詞，視為單一概念，主要動詞使用單數 is。`
        }),
        () => ({
          question: `【I don't think that... 否定轉移】${preamble}\nI don't think that he ________ come to the meeting on time.`,
          options: [`will`, `won't`, `doesn't`, `isn't`],
          answer: 0,
          hint: `💡 提示：英文習慣將子句的否定轉移至主要子句 (I don't think he will come)。`,
          explanation: `📖 詳解：英語否定轉移慣用法：主要動詞為 think/believe 時，否定放在主要子句 don't think，子句用肯定 will come。`
        }),
        () => ({
          question: `【間接問句中的 how long】${preamble}\nCould you tell me how long ________ for the delivery to arrive?`,
          options: [`it will take`, `will it take`, `it took`, `does it take`],
          answer: 0,
          hint: `💡 提示：間接問句語序為 it will take，不可倒裝。`,
          explanation: `📖 詳解：how long 後接主詞 it 與助動詞 will take，保持平述語序。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }

    // u5: 附加問句與會考閱讀克漏字
    if (uNum === 5) {
      const archetypes = [
        () => ({
          question: `【附加問句前肯後否法則】${preamble}\nYou haven't finished your homework yet, ________?`,
          options: [`have you`, `haven't you`, `did you`, `do you`],
          answer: 0,
          hint: `💡 提示：直述句為否定 (haven't)，附加問句需用肯定 (have you)。`,
          explanation: `📖 詳解：附加問句口訣：「前否後肯，前肯後否」。主要子句有否定助動詞 haven't，附加問句需用肯定 have you。`
        }),
        () => ({
          question: `【否定副詞 rarely / seldom / never 之附加問句】${preamble}\nDavid seldom eats fast food because he cares about health, ________?`,
          options: [`does he`, `doesn't he`, `is he`, `isn't he`],
          answer: 0,
          hint: `💡 提示：seldom（很少）為否定副詞，句意視為否定，附加問句需用肯定 does he！`,
          explanation: `📖 詳解：句子含有 seldom, rarely, hardly, never 等否定副詞時，該句視為否定句，後方附加問句需使用肯定形式 does he。`
        }),
        () => ({
          question: `【主要動詞為一般動詞的附加問句】${preamble}\nYour sister works at that famous tech company, ________?`,
          options: [`doesn't she`, `does she`, `isn't she`, `is she`],
          answer: 0,
          hint: `💡 提示：主要子句為現在簡單式肯定句，動詞為 works，附加問句用 doesn't she。`,
          explanation: `📖 詳解：主要子句為肯定句，動詞為第三人稱單數一般動詞 works，附加問句助動詞用否定 doesn't she。`
        }),
        () => ({
          question: `【There is/are 存在句的附加問句】${preamble}\nThere are many students in the library studying for exams, ________?`,
          options: [`aren't there`, `aren't they`, `don't there`, `are there`],
          answer: 0,
          hint: `💡 提示：There is/are 句型的附加問句主詞依然使用 there (aren't there)。`,
          explanation: `📖 詳解：There be 句型的附加問句，代名詞位置必須保留 there，故用 aren't there?。`
        }),
        () => ({
          question: `【祈使句的附加問句 will you】${preamble}\nDon't make any loud noise in the hospital ward, ________?`,
          options: [`will you`, `shall we`, `do you`, `don't you`],
          answer: 0,
          hint: `💡 提示：否定祈使句 Don't... 的附加問句一律用 will you?`,
          explanation: `📖 詳解：否定祈使句（Don't + 原形）的附加問句固定使用 will you?。`
        }),
        () => ({
          question: `【Let's 的附加問句 shall we】${preamble}\nLet's go for a bicycle ride along the riverside park, ________?`,
          options: [`shall we`, `will you`, `aren't we`, `don't we`],
          answer: 0,
          hint: `💡 提示：Let's 開頭的提議句，附加問句一律為 shall we?`,
          explanation: `📖 詳解：Let's（我們一起...）代表第一人稱複數提議，附加問句固定搭配 shall we?。`
        }),
        () => ({
          question: `【情態助動詞 can / should 的附加問句】${preamble}\nWe should always obey the traffic safety rules, ________?`,
          options: [`shouldn't we`, `should we`, `don't we`, `can't we`],
          answer: 0,
          hint: `💡 提示：主要子句有情態助動詞 should，附加問句相應使用 shouldn't we。`,
          explanation: `📖 詳解：主要子句含有助動詞 should，附加問句需使用該助動詞之否定形 shouldn't we。`
        }),
        () => ({
          question: `【I am 的附加問句 aren't I】${preamble}\nI am your best friend in this school, ________?`,
          options: [`aren't I`, `am not I`, `amn't I`, `isn't I`],
          answer: 0,
          hint: `💡 提示：I am... 的否定附加問句口語固定為 aren't I?`,
          explanation: `📖 詳解：I am 的否定附加問句在現代英語標準口語中固定約定俗成為 aren't I?。`
        }),
        () => ({
          question: `【不定代名詞 everyone / someone 的附加問句】${preamble}\nEveryone was excited about the upcoming school trip, ________?`,
          options: [`weren't they`, `wasn't he`, `wasn't it`, `didn't they`],
          answer: 0,
          hint: `💡 提示：everyone 雖然在單句當單數主詞，但附加問句代名詞指人需用 they，be動詞改為 weren't。`,
          explanation: `📖 詳解：指人的不定代名詞 (everyone, somebody) 在附加問句中代名詞一律用 they，因此動詞需呼應為複數 weren't they?。`
        }),
        () => ({
          question: `【指物的不定代名詞 everything 的附加問句】${preamble}\nEverything looks ready for the grand opening ceremony, ________?`,
          options: [`doesn't it`, `don't they`, `isn't it`, `doesn't they`],
          answer: 0,
          hint: `💡 提示：everything（每件事）在附加問句中代名詞用單數 it (doesn't it)。`,
          explanation: `📖 詳解：指物的不定代名詞 (everything, nothing, something) 在附加問句中用單數代名詞 it 指代。`
        }),
        () => ({
          question: `【have to 義務動詞的附加問句】${preamble}\nLeo has to practice playing the guitar for two hours every day, ________?`,
          options: [`doesn't he`, `hasn't he`, `isn't he`, `didn't he`],
          answer: 0,
          hint: `💡 提示：has to 中的 has 是一般動詞，附加問句需用 doesn't he（不可用 hasn't he）！`,
          explanation: `📖 詳解：has to（必須）中的 has 為一般動詞，現在簡單式單數否定附加問句助動詞用 doesn't he。`
        }),
        () => ({
          question: `【複合句以主要子句決定附加問句】${preamble}\nI know that Mr. Peterson didn't steal the money, ________?`,
          options: [`don't I`, `did he`, `didn't he`, `do I`],
          answer: 0,
          hint: `💡 提示：複合句以主要子句 (I know...) 決定附加問句 (don't I)。`,
          explanation: `📖 詳解：複合句由主要子句 (I know) 的主詞動詞決定附加問句，故用 don't I?。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 17)) % archetypes.length]();
    }
  }

  // ============================================================
  // 歷屆會考題 (past-exams)
  // ============================================================
  if (gradeId === 'past-exams') {
    const archetypes = [
      () => ({
        question: `【112會考真題典範-時態與生活情境】${preamble}\nListen! Someone ________ the piano in the music room next door.`,
        options: [`is playing`, `played`, `plays`, `will play`],
        answer: 0,
        hint: `💡 提示：祈使句 Listen! / Look! 表示說話當下正在發生的動作，需用現在進行式 (is/am/are + V-ing)。`,
        explanation: `📖 詳解：Listen! 提醒聽者注意當下聲響，表示「此時此刻正有人在彈鋼琴」，動詞時態必須使用現在進行式 is playing。`
      }),
      () => ({
        question: `【111會考真題典範-轉折連接詞辨析】${preamble}\n________ it was raining heavily, the students still walked to school on time.`,
        options: [`Although`, `Because`, `If`, `So`],
        answer: 0,
        hint: `💡 提示：雖然下大雨，學生依然準時到校，前後為讓步轉折語意。`,
        explanation: `📖 詳解：前半句表示下大雨（阻礙），後半句表示仍準時到校，前後具讓步對比關係，故使用 Although (雖然)。`
      }),
      () => ({
        question: `【110會考真題典範-不定詞與動名詞主詞】${preamble}\n________ English songs with friends is a fun and effective way to practice speaking.`,
        options: [`Singing`, `Sing`, `Sang`, `Song`],
        answer: 0,
        hint: `💡 提示：動名詞 V-ing 作為全句主詞，且視為單數。`,
        explanation: `📖 詳解：句子缺少主詞，使用動名詞 Singing 開頭作為整體名詞片語主詞，搭配單數動詞 is。`
      }),
      () => ({
        question: `【109會考真題典範-關係代名詞陷阱】${preamble}\nThe movie ________ won three Oscar awards yesterday was directed by a Taiwanese director.`,
        options: [`which`, `who`, `whom`, `whose`],
        answer: 0,
        hint: `💡 提示：先行詞 The movie 為事物，在關係子句中作主詞，用 which 或 that。`,
        explanation: `📖 詳解：The movie 為物，關係子句內作動詞 won 的主詞，關係代名詞需用 which 或 that。`
      }),
      () => ({
        question: `【108會考真題典範-現在完成式 since 搭配】${preamble}\nOur school baseball team has won three championships ________ 2018.`,
        options: [`since`, `for`, `in`, `at`],
        answer: 0,
        hint: `💡 提示：完成式接特定過去時間起點（2018年）用 since。`,
        explanation: `📖 詳解：2018 是過去明確年份時間起點，搭配現在完成式 (has won) 需使用介系詞 since。`
      }),
      () => ({
        question: `【會考素養長篇克漏字-跨文化理解】${preamble}\nIn many Western cultures, making direct eye contact during a conversation ________ as a sign of confidence and honesty.`,
        options: [`is seen`, `saw`, `has seen`, `seeing`],
        answer: 0,
        hint: `💡 提示：眼神接觸是「被視為」，需用被動語態 is seen。`,
        explanation: `📖 詳解：動名詞片語 making direct eye contact 為主詞，被視為一種自信的象徵，需用單數被動語態 is seen as。`
      }),
      () => ({
        question: `【會考圖表閱讀素養題-火車時刻表推論】${preamble}\nTrain A leaves at 10:15 and arrives at 12:45. Train B leaves at 10:45 and arrives at 12:15. Which statement is TRUE?`,
        options: [
          `Train B is faster than Train A by one hour.`,
          `Train A is faster than Train B by thirty minutes.`,
          `Both trains take exactly two hours.`,
          `Train B arrives later than Train A.`
        ],
        answer: 0,
        hint: `💡 提示：Train A 耗時 2小時30分；Train B 耗時 1小時30分，相差 1 小時。`,
        explanation: `📖 詳解：計算車程：Train A: 10:15 -> 12:45 (2.5小時)；Train B: 10:45 -> 12:15 (1.5小時)。Train B 速度較快且節省 1 小時車程。`
      }),
      () => ({
        question: `【會考公告告示閱讀-圖書館借閱規定】${preamble}\n"Books may be borrowed for up to 14 days. A fine of $5 per day will be charged for overdue items." What does this notice mean?`,
        options: [
          `You have to pay if you return the book after 14 days.`,
          `You cannot borrow more than five books at a time.`,
          `Borrowing books costs $5 every two weeks.`,
          `The library is closed on the 14th of every month.`
        ],
        answer: 0,
        hint: `💡 提示：overdue items 表逾期未還書籍，每天罰款 5 元。`,
        explanation: `📖 詳解：公告指出最多借閱 14 天，逾期將被處以每日 5 元罰金，因此借超過 14 天未還必須繳交罰款。`
      })
    ];
    return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
  }

  // ============================================================
  // 私校精選 (private-school)
  // ============================================================
  if (gradeId === 'private-school') {
    if (uNum === 1) {
      const archetypes = [
        () => ({
          question: `【私校進階字彙與片語-同義字替換】${preamble}\n"The scientist's brilliant discovery had a profound impact on medical technology." What is the closest in meaning to "profound"?`,
          options: [`deep and significant`, `slight and temporary`, `dangerous and harmful`, `uninteresting and dull`],
          answer: 0,
          hint: `💡 提示：profound 意為「深遠的、重大的」。`,
          explanation: `📖 詳解：profound 意指深遠的、巨大的 (deep and significant impact)。`
        }),
        () => ({
          question: `【私校高階文法-分詞構句簡化】${preamble}\n________ by the loud thunder, the frightened puppy hid under the bed.`,
          options: [`Terrified`, `Terrifying`, `Terrify`, `To terrify`],
          answer: 0,
          hint: `💡 提示：puppy 被雷聲嚇到，過去分詞表被動受驚嚇 (Terrified by...)。`,
          explanation: `📖 詳解：分詞構句還原為 Because the puppy was terrified by...，省略連接詞與同主詞後保留過去分詞 Terrified。`
        }),
        () => ({
          question: `【私校介系詞特殊搭配】${preamble}\nShe succeeded in winning the championship ________ virtue of her persistent hard work.`,
          options: [`by`, `in`, `with`, `for`],
          answer: 0,
          hint: `💡 提示：by virtue of 意為「憑藉著、由於」。`,
          explanation: `📖 詳解：by virtue of 為進階正式片語，意為「憑藉、由於 (because of / through)」。`
        }),
        () => ({
          question: `【私校進階倒裝句型】${preamble}\nHardly ________ the train station when the heavy downpour started.`,
          options: [`had we reached`, `we had reached`, `did we reach`, `we reached`],
          answer: 0,
          hint: `💡 提示：Hardly + had + S + p.p. ... when 表「一...就...」之經典否定副詞倒裝句型。`,
          explanation: `📖 詳解：否定副詞 Hardly 置於句首時，主要子句必須倒裝為 had + 主詞 + p.p.。`
        }),
        () => ({
          question: `【私校假設法與與過去事實相反】${preamble}\nIf you ________ me about the urgent change of plan yesterday, I wouldn't have made that mistake.`,
          options: [`had informed`, `informed`, `would inform`, `have informed`],
          answer: 0,
          hint: `💡 提示：與過去事實相反的假設語氣：If + S + had p.p., S + would have p.p.`,
          explanation: `📖 詳解：由後半句 wouldn't have made that mistake 可知為「與過去事實相反」的假設語氣，if 子句需使用過去完成式 had informed。`
        }),
        () => ({
          question: `【私校常考片語-克服障礙】${preamble}\nAfter months of rehabilitation, the athlete finally ________ all the physical obstacles and returned to the track.`,
          options: [`overcame`, `overlooked`, `undertook`, `overtook`],
          answer: 0,
          hint: `💡 提示：overcome 意為「戰勝、克服障礙」，過去式為 overcame。`,
          explanation: `📖 詳解：overcome obstacles 為固定慣用搭配，意為戰勝困難挑戰。overlook 意為忽視；undertake 意為承擔。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    if (uNum === 2) {
      // 保持長篇閱讀題群庫容
      const passageBiomimicry = `Biomimicry is the practice of looking to nature for solutions to human engineering problems. When Japan introduced its 500-Series bullet train in 1997, it was capable of traveling at speeds up to 300 kilometers per hour. However, it had an alarming issue: exiting narrow mountain tunnels caused massive atmospheric pressure waves, creating a thunderous sonic boom heard more than 400 meters away. Engineering director Eiji Nakatsu, an avid birdwatcher, realized the solution lay in the kingfisher—a bird that dives cleanly from air into dense water at high speed with barely a splash. By reshaping the train's blunt nose into a long, tapered beak-like shape modeled after the kingfisher, engineers not only completely eliminated the tunnel sonic boom but also reduced energy consumption by fifteen percent.`;

      const archetypes = [
        () => ({
          isReading: true,
          readingText: passageBiomimicry,
          question: `【私校長篇閱測-仿生原理】What natural feature inspired the design of the Shinkansen bullet train's nose?`,
          options: [
            `The long, slender beak of a kingfisher diving into water.`,
            `The powerful tail fin of a blue whale swimming in the ocean.`,
            `The aerodynamic wings of an eagle soaring in high winds.`,
            `The protective hard shell of a desert tortoise.`
          ],
          answer: 0,
          hint: `💡 提示：新幹線車頭參考翠鳥 (kingfisher) 入水不濺水花的細長鳥喙。`,
          explanation: `📖 詳解：工程師模仿翠鳥由空氣鑽入水中不受阻力的流線型鳥喙，成功解決列車進隧道的音爆問題。`
        }),
        () => ({
          isReading: true,
          readingText: passageBiomimicry,
          question: `【私校長篇閱測-工程成效】What double advantage did the biomimetic train design achieve?`,
          options: [
            `It eliminated tunnel sonic booms and reduced energy use by fifteen percent.`,
            `It made the train travel faster than commercial airplanes.`,
            `It allowed the train to travel underwater across deep lakes.`,
            `It decreased ticket prices by half for all passengers.`
          ],
          answer: 0,
          hint: `💡 提示：eliminated the loud sonic boom... reducing energy consumption by fifteen percent。`,
          explanation: `📖 詳解：翠鳥車頭設計一舉消除進入隧道時的微氣壓波噪音（音爆），同時大幅降低 15% 電能消耗。`
        }),
        () => ({
          question: `【私校批判思維閱測-主旨概括】What is the main purpose of biomimicry in modern technology?`,
          options: [
            `To adapt natural designs and ecological mechanisms to solve human design challenges.`,
            `To replace all human machinery with trained wild animals.`,
            `To capture rare species for display in urban botanical gardens.`,
            `To study historical fossils without applying findings to real life.`
          ],
          answer: 0,
          hint: `💡 提示：仿生學的主旨是借鏡自然界的演化智慧來解決人類的工程與設計難題。`,
          explanation: `📖 詳解：全文與仿生學核心定義均為透過師法自然演化千萬年的生物構造機制，解決現代工程與科技難題。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }
  }

  // 預設 Fallback
  return {
    question: `【108 課綱英語核心素養】${preamble}\nChoose the grammatically correct sentence regarding "${conceptTag}":`,
    options: [
      `She has lived in Taipei since she was a little girl.`,
      `She has lived in Taipei for she was a little girl.`,
      `She lived in Taipei since five years.`,
      `She is living in Taipei since yesterday.`
    ],
    answer: 0,
    hint: `💡 提示：since 後面接表示時間點的過去簡單式子句。`,
    explanation: `📖 詳解：現在完成式搭配 since + 過去時間起點子句 (since she was a little girl)，時態結構完全正確。`
  };
}
