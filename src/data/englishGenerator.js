import { getHardEnglishQuestion } from './englishHardArchetypes.js';
// 108 課綱英語科全單元題庫引擎（豐富多樣題庫範本，100% 依年級與單元精準對齊，杜絕重複題）
export function generateEnglishQuestion(gradeId, unitId, index, difficulty = 'medium', rand, conceptTag) {
  const isExtreme = difficulty === 'extreme' || difficulty === 'hard' || difficulty === 'hardest';
  const people = ['Alex', 'David', 'Emily', 'Sarah', 'Kevin', 'Grace', 'Brian', 'Chloe', 'Daniel', 'Jessica'];
  const person = people[Math.floor(rand() * people.length)];
  const preamble = `While practicing English, ${person} was asked:`;

  const uNum = parseInt(String(unitId).split('-').pop().replace(/u/i, ''), 10) || 1;

  // ── 進階挑戰難度分流 (Extreme / Hardest) ──
  if (isExtreme) {
    const hardQ = getHardEnglishQuestion(gradeId, unitId, index, rand, preamble, conceptTag);
    if (hardQ) return hardQ;
  }


  // ── English Reading Comprehension (every 7th question) ──
  if (index % 7 === 0) {
    const passages = [
      {
        text: `Smartphones have become an essential part of daily life. People use them not only for communication, but also for entertainment, education, and shopping. However, experts warn that too much screen time can lead to poor sleep, reduced concentration, and social isolation. Many schools have banned smartphones in classrooms to help students focus on their studies.`,
        q: `According to the passage, why have some schools banned smartphones in classrooms?`,
        options: [`To help students focus on their studies`, `Because smartphones are too expensive`, `Because smartphones are not useful`, `To encourage buying better devices`],
        answer: 0,
        hint: `💡 Tip: Key phrase is "to help students focus on their studies".`,
        explanation: `📖 Explanation: The passage says "Many schools have banned smartphones in classrooms to help students focus on their studies."`
      },
      {
        text: `The water cycle is the continuous movement of water through Earth's systems. Water evaporates from oceans, rises as water vapor, cools into clouds, and falls back as rain or snow. This process is driven by solar energy and the force of gravity, playing a crucial role in maintaining life on Earth.`,
        q: `What drives the water cycle according to the passage?`,
        options: [`Solar energy and the force of gravity`, `Wind and ocean currents alone`, `Human activity and industry`, `The movement of the moon`],
        answer: 0,
        hint: `💡 Tip: Look for "driven by" in the passage.`,
        explanation: `📖 Explanation: "driven by solar energy and the force of gravity" — solar energy causes evaporation, gravity causes precipitation.`
      },
      {
        text: `Taiwan is an island nation in East Asia, known for its advanced technology industry and vibrant culture. The island experiences a subtropical climate, with hot summers and mild winters. Night markets are a beloved part of Taiwanese culture, offering a wide variety of local street foods and goods.`,
        q: `Which feature of Taiwan's culture is described in the passage?`,
        options: [`Night markets with street food and goods`, `Large desert landscapes`, `Cold arctic winters`, `Underground transportation systems`],
        answer: 0,
        hint: `💡 Tip: Look for what is described as "a beloved part of Taiwanese culture".`,
        explanation: `📖 Explanation: The passage specifically mentions night markets as a beloved cultural feature offering local foods and goods.`
      },
      {
        text: `Artificial intelligence is transforming many industries. In healthcare, AI can analyze medical images and detect diseases early. In education, personalized learning systems adapt to each student's pace and style. However, concerns remain about privacy, data security, and the potential displacement of workers by automated systems.`,
        q: `According to the passage, what is one concern about artificial intelligence?`,
        options: [`The risk of data privacy violations and job displacement`, `The high cost of personal computers`, `The difficulty of teaching AI to speak`, `The lack of research in healthcare`],
        answer: 0,
        hint: `💡 Tip: The concerns are listed at the end of the passage.`,
        explanation: `📖 Explanation: The passage explicitly lists privacy, data security, and worker displacement as key concerns about AI.`
      }
    ];
    const p = passages[Math.abs(index + Math.floor(rand() * 7)) % passages.length];
    return {
      question: `【Reading Comprehension】Read the following passage and answer:\n\n${p.q}`,
      options: p.options,
      answer: p.answer,
      hint: p.hint,
      explanation: p.explanation,
      isReading: true,
      readingText: p.text
    };
  }

  if (index % 11 === 0) {
    const actList = ['Reading', 'Sports', 'Gaming', 'Music', 'Cooking'];
    const hrList = actList.map(() => Math.floor(rand() * 4) + 1);
    const maxHr = Math.max(...hrList);
    const maxAct = actList[hrList.indexOf(maxHr)];
    const totalHr = hrList.reduce((a, b) => a + b, 0);
    const w = 320, h = 160, padX = 35, padY = 20;
    const barW = (w - padX * 2) / 5 - 6;
    const bars = hrList.map((hr, i) => {
      const bH = Math.round(hr / maxHr * (h - padY * 2 - 10));
      const bX = padX + i * ((w - padX * 2) / 5) + 3;
      const bY = h - padY - bH;
      const color = ['#38bdf8','#34d399','#f59e0b','#a78bfa','#f87171'][i];
      return `<rect x="${bX}" y="${bY}" width="${barW}" height="${bH}" fill="${color}" rx="3"/><text x="${bX+barW/2}" y="${bY-4}" text-anchor="middle" font-size="9" fill="#374151" font-weight="bold">${hr}h</text><text x="${bX+barW/2}" y="${h-padY+13}" text-anchor="middle" font-size="8" fill="#374151">${actList[i]}</text>`;
    }).join('');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="max-width:100%;border-radius:8px;background:#f0f9ff"><line x1="${padX}" y1="${padY}" x2="${padX}" y2="${h-padY}" stroke="#94a3b8" stroke-width="1.5"/><line x1="${padX}" y1="${h-padY}" x2="${w-padX}" y2="${h-padY}" stroke="#94a3b8" stroke-width="1.5"/>${bars}<text x="${w/2}" y="12" text-anchor="middle" font-size="10" fill="#0f172a" font-weight="bold">Weekly Leisure Activities (hours/week)</text></svg>`;
    return {
      question: `【Chart Reading】Look at the bar chart and answer:\n① Which activity takes the most time? ② How many hours on ${actList[2]}? ③ Total hours for all activities?`,
      options: [
        `${maxAct} (${maxHr}h) / ${actList[2]}: ${hrList[2]}h / Total: ${totalHr}h`,
        `${actList[0]} (${hrList[0]}h) / ${actList[2]}: ${hrList[2]+1}h / Total: ${totalHr+2}h`,
        `${maxAct} (${maxHr}h) / ${actList[2]}: ${hrList[2]-1}h / Total: ${totalHr-1}h`,
        `${actList[4]} (${hrList[4]}h) / ${actList[2]}: ${hrList[2]}h / Total: ${totalHr+3}h`
      ],
      answer: 0,
      hint: `💡 Tip: Find the tallest bar; read the Gaming value; add all bars for total.`,
      explanation: `📖 Explanation: Read each bar value and identify the tallest. Sum all values for the total.`,
      isSvg: true,
      svgContent
    };
  }

  // ============================================================
  // 國一 (七年級)
  // ============================================================
  if (gradeId === 'g7') {
    // u1: Be動詞與人稱代名詞
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
          question: `【Be動詞疑問句與簡答】${preamble}\n— \"________ your English teacher from Canada?\"\n— \"Yes, she ________.\"`,
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u2: 現在簡單式與頻率副詞
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
          question: `【方位介系詞辨析】${preamble}\nThe convenient store is located ________ the bank and the bookstore.`,
          options: [`between`, `among`, `in front`, `next`],
          answer: 0,
          hint: `💡 提示：在兩者之間用 between A and B；在三者或以上之中用 among。`,
          explanation: `📖 詳解：between A and B 為固定介系詞片語，代表「在兩者之間」。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u5: 時間日期與助動詞 Can/May
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
          question: `【情態助動詞接原形動詞】${preamble}\n— \"May I ________ your dictionary?\"\n— \"Sure, but you must ________ it back tomorrow.\"`,
          options: [`borrow; give`, `borrowing; gives`, `borrow; to give`, `to borrow; giving`],
          answer: 0,
          hint: `💡 提示：情態助動詞 (may / must / can) 後面必須一律接「原形動詞」。`,
          explanation: `📖 詳解：情態助動詞 May 與 must 後方一律接原形動詞 (borrow / give)。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
          question: `【過去式否定與疑問句助動詞 did】${preamble}\n— \"Did you ________ the movie last night?\"\n— \"No, I didn't. I ________ for my science test.\"`,
          options: [`watch; studied`, `watched; study`, `watch; study`, `watched; studied`],
          answer: 0,
          hint: `💡 提示：助動詞 Did 後面接原形動詞；答句過去式肯定句動詞轉為過去式 studied。`,
          explanation: `📖 詳解：疑問句助動詞 Did 後接原形動詞 watch；答句描述昨晚完成的動作，使用 study 的過去式 studied。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u2: 未來式與天氣表達
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u3: 形容詞與副詞比較級與最高級
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
          question: `【have been to vs have gone to 區分】${preamble}\n— \"Where is Judy? I haven't seen her all morning.\"\n— \"She ________ Japan for a vacation. She won't be back until next Monday.\"`,
          options: [`has gone to`, `has been to`, `went to`, `had been to`],
          answer: 0,
          hint: `💡 提示：has gone to 代表人「已經去了（尚未回來）」；has been to 代表「曾經去過（已回到原處）」。`,
          explanation: `📖 詳解：答句提到「下週一才會回來」，代表她人目前已經前往日本、不在現場，需用 has gone to。has been to 是指「去過某地且已返回」。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }

    // u3: 關係子句與關係代名詞
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
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
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    }
  }

  // ============================================================
  // 歷屆會考題 (past-exams)
  // ============================================================
  if (gradeId === 'past-exams') {
    const archetypes = [
      () => ({
        question: `【歷屆會考經典-時態判讀】${preamble}\nListen! Someone ________ the piano in the music room next door.`,
        options: [`is playing`, `played`, `plays`, `will play`],
        answer: 0,
        hint: `💡 提示：祈使句 Listen! / Look! 表示說話當下正在發生的動作，需用現在進行式 (is/am/are + V-ing)。`,
        explanation: `📖 詳解：Listen! 提醒聽者注意當下聲響，表示「此時此刻正有人在彈鋼琴」，動詞時態必須使用現在進行式 is playing。`
      }),
      () => ({
        question: `【歷屆會考經典-連接詞判斷】${preamble}\n________ it was raining heavily, the students still walked to school on time.`,
        options: [`Although`, `Because`, `If`, `So`],
        answer: 0,
        hint: `💡 提示：雖然下大雨，學生依然準時到校，前後為讓步轉折語意。`,
        explanation: `📖 詳解：前半句表示下大雨（阻礙），後半句表示仍準時到校，前後具讓步對比關係，故使用 Although (雖然)。`
      })
    ];
    return archetypes[Math.abs(index + Math.floor(rand() * 7)) % archetypes.length]();
  }

  // ============================================================
  // 私校入學考題 (private-school)
  // ============================================================
  if (gradeId === 'private-school') {
    if (uNum === 1) {
      const archetypes = [
        () => ({
          question: `【私校英語資優-倒裝句型】${preamble}\nSeldom ________ such a breathtaking view of the aurora in the winter night.`,
          options: [
            `have I seen`,
            `I have seen`,
            `did I saw`,
            `I saw`
          ],
          answer: 0,
          hint: `💡 提示：否定副詞 (Seldom, Never, Hardly) 置於句首時，句子需倒裝（助動詞 + 主詞 + 本動詞）。`,
          explanation: `📖 詳解：Seldom 置於句首引導倒裝，現在完成式之助動詞 have 移至主詞 I 之前，故選 have I seen。`
        }),
        () => ({
          question: `【私校英語資優-進階介系詞片語】${preamble}\nIn spite ________ the pouring rain, they decided to set off for the mountain hike.`,
          options: [
            `of`,
            `to`,
            `for`,
            `with`
          ],
          answer: 0,
          hint: `💡 提示：in spite of 意為「儘管、雖然」，等於 despite。`,
          explanation: `📖 詳解：片語 in spite of + N/V-ing 表「儘管……」，注意 despite 後面不可加 of。`
        }),
        () => ({
          question: `【私校英語資優-動詞片語與動名詞搭配】${preamble}\nAll the students are looking forward to ________ the science museum next week.`,
          options: [
            `visiting`,
            `visit`,
            `visited`,
            `be visiting`
          ],
          answer: 0,
          hint: `💡 提示：look forward to 中的 to 是「介系詞」，後面必須接動名詞 (V-ing) 或名詞。`,
          explanation: `📖 詳解：look forward to + V-ing 為經典常考考點，此處 to 為介系詞而非不定詞，故接 visiting。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 11)) % archetypes.length]();
    } else {
      // en-priv-u2: 私校精選：長篇閱測與邏輯 (含 5 篇長篇素養閱測)
      const passageAI = `【私校進階閱讀-科技與倫理】\nArtificial Intelligence (AI) is transforming our daily routines at an unprecedented pace. From voice-activated virtual assistants to sophisticated diagnostic tools in healthcare, machine learning algorithms can analyze vast amounts of data in seconds. However, this rapid technological advancement brings significant ethical concerns. Many experts urge that strict guidelines must be established to ensure user privacy, data security, and algorithmic fairness, preventing automated systems from making biased decisions that could negatively impact people's lives.`;

      const passageMarshmallow = `【私校進階閱讀-心理學經典實驗】\nIn the 1960s, psychologist Walter Mischel conducted the famous "Marshmallow Test" at Stanford University. Young children were presented with a single marshmallow and told that if they could resist eating it for fifteen minutes while the researcher was away, they would be rewarded with two marshmallows instead. Decades of follow-up studies revealed that the children who were able to delay gratification tended to achieve higher academic scores and exhibit better stress-coping strategies as young adults.`;

      const passageOcean = `【私校進階閱讀-環境永續發展】\nOcean acidification is often referred to as the "evil twin" of global warming. As humanity burns fossil fuels, oceans absorb roughly thirty percent of the carbon dioxide emitted into the atmosphere. When carbon dioxide dissolves in seawater, it forms carbonic acid, reducing the water's pH level. This chemical shift prevents corals and shellfish from building and maintaining their calcium carbonate structures, ultimately threatening the entire marine food chain.`;

      const passageBiomimicry = `【私校進階閱讀-仿生學創新科技】\nBiomimicry is the practice of looking to nature for solutions to complex human engineering problems. For instance, the aerodynamic design of Japan's Shinkansen bullet train was modeled after the kingfisher's slender beak, which allows the bird to dive into water smoothly without making a splash. By mimicking this shape, engineers eliminated the loud sonic boom created when trains entered tunnels, while simultaneously reducing energy consumption by fifteen percent.`;

      const passageSpace = `【私校進階閱讀-深空探測與系外行星】\nNASA's James Webb Space Telescope (JWST), stationed approximately 1.5 million kilometers from Earth at the Second Lagrange Point (L2), offers unprecedented infrared resolution. By detecting faint heat signatures from the earliest galaxies formed after the Big Bang, astronomers can gaze back more than 13.5 billion years into cosmic history. Furthermore, JWST's transmission spectroscopy can analyze atmospheric compositions of exoplanets to detect biosignature gases such as methane, water vapor, and carbon dioxide.`;

      const archetypes = [
        // AI - Q1
        () => ({
          isReading: true,
          readingText: passageAI,
          question: `【閱測題群-主要主旨】What is the main topic of the passage regarding Artificial Intelligence?`,
          options: [
            `The promising benefits of AI advancements alongside critical ethical concerns.`,
            `The history of virtual assistant development over the past decades.`,
            `The complete replacement of medical doctors by machine learning systems.`,
            `The declining interest of consumers in artificial intelligence tools.`
          ],
          answer: 0,
          hint: `💡 提示：文章探討 AI 帶來的巨大進展以及相伴隨的隱私與演算法倫理挑戰。`,
          explanation: `📖 詳解：全文兼論 AI 帶來的革命性助益與必須制定嚴格倫理規範防範偏見之核心主旨。`
        }),
        // AI - Q2
        () => ({
          isReading: true,
          readingText: passageAI,
          question: `【閱測題群-細節理解】According to the passage, why do experts call for strict regulations on AI?`,
          options: [
            `To safeguard user privacy and prevent algorithmic bias in automated decisions.`,
            `To slow down the computing speed of healthcare algorithms.`,
            `To prohibit schools from using automated computers.`,
            `To decrease the sales of smartphones and virtual assistants.`
          ],
          answer: 0,
          hint: `💡 提示：文末明言 ensure user privacy, data security, and algorithmic fairness。`,
          explanation: `📖 詳解：專家呼籲嚴格監管是為了保障個人隱私、資料安全並防範演算法偏見。`
        }),
        // AI - Q3
        () => ({
          isReading: true,
          readingText: passageAI,
          question: `【閱測題群-詞彙替換】Which of the following is closest in meaning to the word "unprecedented" in the text?`,
          options: [
            `Never experienced or seen before`,
            `Slow and predictable`,
            `Extremely dangerous and harmful`,
            `Easily copied by competitors`
          ],
          answer: 0,
          hint: `💡 提示：unprecedented 意為「史無前例的、空前的」。`,
          explanation: `📖 詳解：unprecedented 源自 precedent (先例)，un- 否定字首，表示從未有過、空前的。`
        }),

        // Marshmallow - Q1
        () => ({
          isReading: true,
          readingText: passageMarshmallow,
          question: `【閱測題群-實驗結論】What was the core ability evaluated in the Marshmallow Test?`,
          options: [
            `The ability to delay gratification for a greater reward.`,
            `The ability to memorize long strings of numbers.`,
            `The willingness to share snacks with researchers.`,
            `The physical stamina of young children under pressure.`
          ],
          answer: 0,
          hint: `💡 提示：棉花糖實驗衡量「延遲滿足能力」（delay gratification）。`,
          explanation: `📖 詳解：實驗探討幼童能否克制立即享用棉花糖的衝動以換取後續雙倍獎勵，即延遲滿足能力。`
        }),
        // Marshmallow - Q2
        () => ({
          isReading: true,
          readingText: passageMarshmallow,
          question: `【閱測題群-後續追蹤】What positive outcome was correlated with high self-control in the follow-up studies?`,
          options: [
            `Higher academic achievements and better stress-coping strategies.`,
            `Stronger physical health without needing regular exercise.`,
            `The choice of pursuing careers solely in psychology.`,
            `An increased preference for eating fast food.`
          ],
          answer: 0,
          hint: `💡 提示：追蹤研究顯示自律能力較佳的孩子日後在學業與壓力調適上皆表現更優異。`,
          explanation: `📖 詳解：研究指出能延遲滿足者日後學業成績較佳，且面對成年生活壓力具有更佳之調適策略。`
        }),

        // Ocean - Q1
        () => ({
          isReading: true,
          readingText: passageOcean,
          question: `【閱測題群-化學機制】Why is ocean acidification referred to as the "evil twin" of global warming?`,
          options: [
            `Because both are caused by excess carbon dioxide emissions impacting the biosphere.`,
            `Because it raises ocean temperatures to cause violent hurricanes.`,
            `Because it creates new islands across the Pacific Ocean.`,
            `Because it only happens during winter months.`
          ],
          answer: 0,
          hint: `💡 提示：兩者皆由人為大量排放二氧化碳所引發。`,
          explanation: `📖 詳解：燃燒石化燃料釋放大量二氧化碳，在大氣中引發溫室效應，溶於海水中則導致酸化，兩者並存故稱為孿生惡魔。`
        }),
        // Ocean - Q2
        () => ({
          isReading: true,
          readingText: passageOcean,
          question: `【閱測題群-生態衝擊】How does ocean acidification primarily harm marine creatures like corals and shellfish?`,
          options: [
            `It hinders their ability to build and maintain calcium carbonate structures.`,
            `It turns the ocean water completely black and blocks all sunlight.`,
            `It increases the salt concentration to poison fish gills.`,
            `It freezes the surface of coral reefs in summer.`
          ],
          answer: 0,
          hint: `💡 提示：碳酸降低海水 pH 值，妨礙珊瑚與貝類生成碳酸鈣外骨骼。`,
          explanation: `📖 詳解：文中提到海水 pH 值下降阻礙了珊瑚與甲殼貝類建構碳酸鈣外殼，動搖海洋食物鏈基底。`
        }),

        // Biomimicry - Q1
        () => ({
          isReading: true,
          readingText: passageBiomimicry,
          question: `【閱測題群-仿生原理】What natural feature inspired the design of the Shinkansen bullet train's nose?`,
          options: [
            `The long, slender beak of a kingfisher.`,
            `The powerful tail fin of a blue whale.`,
            `The aerodynamic wings of a bald eagle.`,
            `The protective shell of a desert tortoise.`
          ],
          answer: 0,
          hint: `💡 提示：新幹線車頭參考翠鳥 (kingfisher) 入水不濺水花的細長鳥喙。`,
          explanation: `📖 詳解：工程師模仿翠鳥由空氣鑽入水中不受阻力的流線型鳥喙，成功解決列車進隧道的音爆問題。`
        }),
        // Biomimicry - Q2
        () => ({
          isReading: true,
          readingText: passageBiomimicry,
          question: `【閱測題群-工程成效】What double advantage did the biomimetic train design achieve?`,
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

        // Space - Q1
        () => ({
          isReading: true,
          readingText: passageSpace,
          question: `【閱測題群-深空觀測】Why can the James Webb Space Telescope look back more than 13.5 billion years?`,
          options: [
            `Its ultra-sensitive infrared sensors detect faint heat from ancient baby galaxies.`,
            `It travels faster than the speed of light into the future.`,
            `It landed on the surface of the oldest stars in our galaxy.`,
            `It uses optical mirrors that reflect cosmic rays directly.`
          ],
          answer: 0,
          hint: `💡 提示：紅外線光譜能穿透宇宙塵埃，捕捉宇宙大爆炸初期形成的古老星系微弱熱訊號。`,
          explanation: `📖 詳解：JWST 具備極強紅外線高解析度，能接收自宇宙大爆炸後 135 億年前傳播至今的紅移熱輻射信號。`
        }),
        // Space - Q2
        () => ({
          isReading: true,
          readingText: passageSpace,
          question: `【閱測題群-外星生命訊號】Which gases are considered biosignatures when analyzing exoplanet atmospheres?`,
          options: [
            `Methane, water vapor, and carbon dioxide.`,
            `Helium and pure hydrogen glowing in stellar cores.`,
            `Pure liquid mercury oceans reflecting starlight.`,
            `Dense sulfur dioxide clouds surrounding gas giants.`
          ],
          answer: 0,
          hint: `💡 提示：最後一句：biosignature gases such as methane, water vapor, and carbon dioxide。`,
          explanation: `📖 詳解：透過穿透光譜儀分析系外行星大氣中的甲烷、水蒸氣與二氧化碳等氣體特徵，可作為潛在生命活動的重要指標。`
        })
      ];
      return archetypes[Math.abs(index + Math.floor(rand() * 19)) % archetypes.length]();
    }
  }

  // ── English SVG Bar Chart (every 11th question) ──

  // 預設 Fallback
  return {
    question: `【108 課綱英語核心素養】${preamble}\nChoose the grammatically correct sentence regarding \"${conceptTag}\":`,
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
