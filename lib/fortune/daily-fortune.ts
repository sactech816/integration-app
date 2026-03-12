/**
 * 今日の運勢おみくじ用のデータとロジック
 * - 九星気学の日運
 * - 数秘術の日運
 * - 古典格言（365個）
 */

// ============================================================
// 型定義
// ============================================================

export interface NineStarFortune {
  star: number;
  starName: string;
  level: '大吉' | '吉' | '中吉' | '小吉' | '末吉' | '凶';
  message: string;
  luckyColor: string;
  luckyDirection: string;
}

export interface NumerologyFortune {
  number: number;
  score: number;
  message: string;
  keyword: string;
  color: string;
}

export interface ClassicalFortune {
  message: string;
  source: string;
  meaning: string;
}

// ============================================================
// 古典格言データ（365個）
// ============================================================

export const CLASSICAL_FORTUNES: ClassicalFortune[] = [
  // 易経 (30)
  { message: "積善の家には必ず余慶あり", source: "易経", meaning: "善い行いを積み重ねる家には、必ず良い報いがある" },
  { message: "天行健なり、君子は自ら強めて息まず", source: "易経", meaning: "天の運行のように力強く、君子は自ら努力を怠らない" },
  { message: "厚徳もって物を載す", source: "易経", meaning: "厚い徳をもって万物を支える" },
  { message: "同声相応じ、同気相求む", source: "易経", meaning: "同じ声は共鳴し、同じ気は引き合う" },
  { message: "君子は器ならず", source: "易経", meaning: "君子は一つの用途に限定されない" },
  { message: "謙は徳の柄なり", source: "易経", meaning: "謙虚さは徳の根本である" },
  { message: "窮すれば則ち変じ、変ずれば則ち通ず", source: "易経", meaning: "行き詰まれば変化し、変化すれば道が開ける" },
  { message: "剛柔相推して変化を生ず", source: "易経", meaning: "剛と柔が交わることで変化が生まれる" },
  { message: "時に中する", source: "易経", meaning: "時機を得て中庸を保つ" },
  { message: "反復其の道", source: "易経", meaning: "繰り返しその道を歩む" },
  { message: "履んで坦かなり、幽人は貞にして吉", source: "易経", meaning: "平らな道を歩み、静かな人は正しくあれば吉" },
  { message: "大往小来", source: "易経", meaning: "大きなものが去り、小さなものが来る" },
  { message: "小往大来", source: "易経", meaning: "小さなものが去り、大きなものが来る" },
  { message: "君子は徳を懐き、小人は土を懐く", source: "易経", meaning: "君子は徳を大切にし、小人は財産を大切にする" },
  { message: "一陽来復", source: "易経", meaning: "冬が去り春が来る、物事が好転する" },
  { message: "否極まれば泰に通ず", source: "易経", meaning: "悪い状態が極まれば良い状態に転じる" },
  { message: "二人同心、其の利は金を断つ", source: "易経", meaning: "二人が心を合わせれば、その力は金をも断つ" },
  { message: "君子は終日乾乾す", source: "易経", meaning: "君子は一日中努力を続ける" },
  { message: "見るべきの象あり", source: "易経", meaning: "観察すべき兆しがある" },
  { message: "元亨利貞", source: "易経", meaning: "大いに通じて正しくあることが利益となる" },
  { message: "柔中にして上下応ず", source: "易経", meaning: "柔軟に中庸を保ち、上下が呼応する" },
  { message: "損して益あり", source: "易経", meaning: "減らすことで増える" },
  { message: "益は損より生ず", source: "易経", meaning: "利益は損失から生まれる" },
  { message: "剛柔接にして地財成る", source: "易経", meaning: "剛と柔が接することで地の財が成る" },
  { message: "時を観て進退す", source: "易経", meaning: "時機を見極めて進退を決める" },
  { message: "潜龍用うる勿れ", source: "易経", meaning: "潜んでいる龍は動くべきではない" },
  { message: "見龍在田、大人を見るに利あり", source: "易経", meaning: "龍が田に現れる、大人に会うのが良い" },
  { message: "飛龍天に在り", source: "易経", meaning: "龍が天に飛び立つ、最高の時" },
  { message: "亢龍悔いあり", source: "易経", meaning: "昇りつめた龍には後悔がある" },
  { message: "龍徳而して正中", source: "易経", meaning: "龍の徳があり、正しく中庸を保つ" },
  // 孟子 (25)
  { message: "天の時は地の利に如かず、地の利は人の和に如かず", source: "孟子", meaning: "天の時機も地の利も、人の和には及ばない" },
  { message: "至誠にして動かざる者は未だ之れあらざるなり", source: "孟子", meaning: "真心を尽くして動かせないものはない" },
  { message: "人の患いは好んで人の師と為るに在り", source: "孟子", meaning: "人の悩みは、人の師になりたがることにある" },
  { message: "天将に大任を是の人に降さんとす", source: "孟子", meaning: "天が大きな任務を与えようとする時" },
  { message: "生を好むも死を甚だしく悪むなり", source: "孟子", meaning: "生を好むが、死を極端に嫌う" },
  { message: "富貴も淫すること能わず", source: "孟子", meaning: "富貴も人を惑わすことはできない" },
  { message: "貧賤も移すこと能わず", source: "孟子", meaning: "貧賤も志を変えることはできない" },
  { message: "威武も屈すること能わず", source: "孟子", meaning: "権力も人を屈服させることはできない" },
  { message: "吾日に吾が身を三省す", source: "孟子", meaning: "私は毎日自分を三度反省する" },
  { message: "仁に当たりては師にも譲らず", source: "孟子", meaning: "仁においては師にも譲らない" },
  { message: "恒産なくして恒心なし", source: "孟子", meaning: "安定した財産がなければ安定した心もない" },
  { message: "人の為さざる所を為し、而る後に能く為す所あり", source: "孟子", meaning: "してはいけないことをせず、その後にすべきことをする" },
  { message: "養心は寡欲を善しと為す", source: "孟子", meaning: "心を養うには欲を少なくすることが良い" },
  { message: "人は患難に生き、安楽に死す", source: "孟子", meaning: "人は苦難の中で成長し、安楽の中で堕落する" },
  { message: "不動心を持つ", source: "孟子", meaning: "動じない心を持つ" },
  { message: "以って斉王と言うべし", source: "孟子", meaning: "これをもって王と語るべきである" },
  { message: "民を貴しと為し、社稷これに次ぐ", source: "孟子", meaning: "民を最も大切にし、国はその次である" },
  { message: "善を楽しみ徳を好む", source: "孟子", meaning: "善を楽しみ、徳を好む" },
  { message: "人の道は正しきに在り", source: "孟子", meaning: "人の道は正しくあることにある" },
  { message: "義を取りて生を捨つ", source: "孟子", meaning: "正義のために命を捨てる" },
  { message: "浩然の気を養う", source: "孟子", meaning: "大らかで正しい気を養う" },
  { message: "人の性は善なり", source: "孟子", meaning: "人の本性は善である" },
  { message: "四端の心", source: "孟子", meaning: "仁義礼智の四つの徳の芽生え" },
  { message: "惻隠の心は仁の端なり", source: "孟子", meaning: "あわれみの心は仁の始まりである" },
  { message: "羞悪の心は義の端なり", source: "孟子", meaning: "恥じる心は義の始まりである" },
  // 論語 (30)
  { message: "学びて時に之を習う、亦説ばしからずや", source: "論語", meaning: "学んで時々それを復習する、なんと喜ばしいことか" },
  { message: "己の欲せざる所は人に施すこと勿れ", source: "論語", meaning: "自分が望まないことは他人にしてはいけない" },
  { message: "過ちて改めざる、是を過ちという", source: "論語", meaning: "過ちを犯して改めないこと、これが本当の過ちである" },
  { message: "君子は和して同ぜず", source: "論語", meaning: "君子は調和するが同調はしない" },
  { message: "小人は同じて和せず", source: "論語", meaning: "小人は同調するが調和しない" },
  { message: "朝に道を聞かば、夕に死すとも可なり", source: "論語", meaning: "朝に真理を知れば、夕方に死んでも悔いはない" },
  { message: "知る者は好む者に如かず", source: "論語", meaning: "知っている者は好きな者には及ばない" },
  { message: "好む者は楽しむ者に如かず", source: "論語", meaning: "好きな者は楽しむ者には及ばない" },
  { message: "温故知新", source: "論語", meaning: "古きを温めて新しきを知る" },
  { message: "三人行けば必ず我が師あり", source: "論語", meaning: "三人で行けば必ず師とすべき人がいる" },
  { message: "過ぎたるは猶及ばざるが如し", source: "論語", meaning: "やり過ぎは足りないのと同じ" },
  { message: "君子は言に訥にして行いに敏ならんと欲す", source: "論語", meaning: "君子は言葉は慎重で行動は素早くありたい" },
  { message: "徳は孤ならず必ず隣あり", source: "論語", meaning: "徳のある人は孤立せず必ず協力者が現れる" },
  { message: "義を見て為さざるは勇なきなり", source: "論語", meaning: "正しいことを見て行わないのは勇気がないことだ" },
  { message: "人の己を知らざるを患えず", source: "論語", meaning: "他人が自分を知らないことを心配するな" },
  { message: "己の人を知らざるを患う", source: "論語", meaning: "自分が他人を知らないことを心配せよ" },
  { message: "巧言令色鮮し仁", source: "論語", meaning: "うまい言葉と取り繕った顔色には仁が少ない" },
  { message: "古の学者は己の為にす", source: "論語", meaning: "昔の学者は自分自身のために学んだ" },
  { message: "今の学者は人の為にす", source: "論語", meaning: "今の学者は他人のために学ぶ" },
  { message: "仁遠からんや、我仁を欲すれば斯に仁至る", source: "論語", meaning: "仁は遠くない、仁を求めればすぐに仁は来る" },
  { message: "吾十有五にして学に志す", source: "論語", meaning: "私は15歳で学問に志した" },
  { message: "三十にして立つ", source: "論語", meaning: "30歳で自立した" },
  { message: "四十にして惑わず", source: "論語", meaning: "40歳で迷わなくなった" },
  { message: "五十にして天命を知る", source: "論語", meaning: "50歳で天命を知った" },
  { message: "六十にして耳順う", source: "論語", meaning: "60歳で人の言葉が素直に聞けるようになった" },
  { message: "七十にして心の欲する所に従って矩を踰えず", source: "論語", meaning: "70歳で思うままに行動しても道を外れない" },
  { message: "歳寒くして然る後に松柏の彫むに後るるを知る", source: "論語", meaning: "寒くなって初めて松や柏が最後まで緑を保つことを知る" },
  { message: "其の位に在らざれば其の政を謀らず", source: "論語", meaning: "その地位にいないなら、その政治に口を出すな" },
  { message: "名不正なれば則ち言順わず", source: "論語", meaning: "名分が正しくなければ言葉も通じない" },
  { message: "逝く者は斯くの如きか、昼夜を舎かず", source: "論語", meaning: "流れ去るものはこのようなものか、昼夜を問わず流れ続ける" },
  // 老子 (20)
  { message: "千里の行も足下に始まる", source: "老子", meaning: "遠い道のりも一歩から始まる" },
  { message: "足るを知る者は富む", source: "老子", meaning: "満足することを知る者は豊かである" },
  { message: "大器晩成", source: "老子", meaning: "大きな器は完成するのに時間がかかる" },
  { message: "上善は水の如し", source: "老子", meaning: "最上の善は水のようなものだ" },
  { message: "無為にして而も為さざる無し", source: "老子", meaning: "作為せずとも成し遂げられないことはない" },
  { message: "柔弱は剛強に勝つ", source: "老子", meaning: "柔らかく弱いものが硬く強いものに勝つ" },
  { message: "和光同塵", source: "老子", meaning: "光を和らげ塵と同じくする" },
  { message: "大直は屈するが若く", source: "老子", meaning: "本当に真っ直ぐなものは曲がっているように見える" },
  { message: "大巧は拙なるが若し", source: "老子", meaning: "本当の巧みさは下手に見える" },
  { message: "治大国は小鮮を烹るが如し", source: "老子", meaning: "大国を治めるのは小魚を煮るようなものだ" },
  { message: "禍は福の倚る所", source: "老子", meaning: "災いは幸福の寄る所である" },
  { message: "福は禍の伏す所", source: "老子", meaning: "幸福は災いの潜む所である" },
  { message: "道は道とすべきも常の道に非ず", source: "老子", meaning: "道と言えるものは永遠の道ではない" },
  { message: "玄の又玄は衆妙の門", source: "老子", meaning: "奥深いものの奥深さはあらゆる妙の入口である" },
  { message: "天長く地久し", source: "老子", meaning: "天は長く地は久しい" },
  { message: "聖人は後にして身を先にす", source: "老子", meaning: "聖人は自分を後回しにして人を先にする" },
  { message: "天網恢恢疎にして漏らさず", source: "老子", meaning: "天の網は広大で粗いが漏らさない" },
  { message: "希言は自然なり", source: "老子", meaning: "言葉少ないのが自然である" },
  { message: "知る者は言わず、言う者は知らず", source: "老子", meaning: "知っている者は語らず、語る者は知らない" },
  { message: "信言は美ならず、美言は信ならず", source: "老子", meaning: "真実の言葉は美しくなく、美しい言葉は真実ではない" },
  // 荘子 (15)
  { message: "大魚は小池に游がず", source: "荘子", meaning: "大きな魚は小さな池では泳がない" },
  { message: "無用の用", source: "荘子", meaning: "役に立たないことの役立ち" },
  { message: "井の中の蛙大海を知らず", source: "荘子", meaning: "狭い世界しか知らない者は広い世界を知らない" },
  { message: "朝三暮四", source: "荘子", meaning: "目先の違いにこだわること" },
  { message: "胡蝶の夢", source: "荘子", meaning: "現実と夢の区別がつかない" },
  { message: "白馬は馬に非ず", source: "荘子", meaning: "白い馬は馬ではない（詭弁）" },
  { message: "吾が生は涯り有りて知は涯り無し", source: "荘子", meaning: "人生には限りがあるが知識には限りがない" },
  { message: "鵬の徙る南冥に往くや", source: "荘子", meaning: "大鵬が南の海に移るとき" },
  { message: "天地は万物の逆旅", source: "荘子", meaning: "天地は万物の旅宿である" },
  { message: "大知は閑閑、小知は間間", source: "荘子", meaning: "大きな知恵はゆったりし、小さな知恵はせかせかする" },
  { message: "渾沌", source: "荘子", meaning: "混沌とした状態こそ自然" },
  { message: "逍遥遊", source: "荘子", meaning: "自由に遊ぶこと" },
  { message: "斉物論", source: "荘子", meaning: "万物は等しい" },
  { message: "坐忘", source: "荘子", meaning: "座って全てを忘れる" },
  { message: "心斎", source: "荘子", meaning: "心を斎戒して清める" },
  // 孫子 (20)
  { message: "彼を知り己を知れば百戦殆うからず", source: "孫子", meaning: "敵を知り自分を知れば百回戦っても危険はない" },
  { message: "兵は詭道なり", source: "孫子", meaning: "戦争は騙し合いである" },
  { message: "戦わずして勝つ", source: "孫子", meaning: "戦わずに勝つのが最上" },
  { message: "疾きこと風の如く", source: "孫子", meaning: "素早いこと風のように" },
  { message: "徐かなること林の如く", source: "孫子", meaning: "静かなこと林のように" },
  { message: "侵掠すること火の如く", source: "孫子", meaning: "攻めること火のように" },
  { message: "動かざること山の如し", source: "孫子", meaning: "動かないこと山のように" },
  { message: "兵は神速を尊ぶ", source: "孫子", meaning: "戦いは素早さを重視する" },
  { message: "兵は拙速を聞くも未だ巧久を睹ず", source: "孫子", meaning: "下手でも速い方が良く、巧みでも長引くのは見たことがない" },
  { message: "善く戦う者は勝ち易きに勝つ", source: "孫子", meaning: "戦上手は勝ちやすい状況で勝つ" },
  { message: "百戦百勝は善の善なる者に非ず", source: "孫子", meaning: "百戦百勝は最善ではない" },
  { message: "戦わずして人の兵を屈するは善の善なる者なり", source: "孫子", meaning: "戦わずに敵を屈服させるのが最善" },
  { message: "上兵は謀を伐つ", source: "孫子", meaning: "最上の戦いは相手の計略を打ち破ること" },
  { message: "其の次は交を伐つ", source: "孫子", meaning: "次は外交関係を断つこと" },
  { message: "其の次は兵を伐つ", source: "孫子", meaning: "その次は軍を攻めること" },
  { message: "其の下は城を攻む", source: "孫子", meaning: "最下は城を攻めること" },
  { message: "勝兵は先ず勝ちて而る後に戦いを求む", source: "孫子", meaning: "勝つ軍は先に勝てる状況を作ってから戦う" },
  { message: "敗兵は先ず戦いて而る後に勝ちを求む", source: "孫子", meaning: "敗れる軍は先に戦ってから勝ちを求める" },
  { message: "善く守る者は九地の下に蔵る", source: "孫子", meaning: "守りの名人は深く隠れる" },
  { message: "善く攻むる者は九天の上に動く", source: "孫子", meaning: "攻めの名人は高所から動く" },
  // 菜根譚 (30)
  { message: "過ぎ去りし波を咎めず、来たらん波を防がず", source: "菜根譚", meaning: "過去を責めず、未来を恐れず" },
  { message: "心地は光明なるを要し、才華は蘊藉なるを要す", source: "菜根譚", meaning: "心は明るく、才能は控えめに" },
  { message: "徳は事業の基なり", source: "菜根譚", meaning: "徳は事業の基礎である" },
  { message: "事業は箕裘の計なり", source: "菜根譚", meaning: "事業は代々続く計画である" },
  { message: "苦中に楽を作す", source: "菜根譚", meaning: "苦しみの中に楽しみを見出す" },
  { message: "淡中に真味あり", source: "菜根譚", meaning: "淡白な中に真の味わいがある" },
  { message: "処世は方円の術を須う", source: "菜根譚", meaning: "世渡りには四角と円の両方の術が必要" },
  { message: "持身は矩矱の心を要す", source: "菜根譚", meaning: "身を持するには規則正しい心が必要" },
  { message: "忙裏偷閑", source: "菜根譚", meaning: "忙しい中にも暇を盗む" },
  { message: "閙中取静", source: "菜根譚", meaning: "騒がしい中にも静けさを取る" },
  { message: "禍福倚伏", source: "菜根譚", meaning: "災いと幸福は背中合わせ" },
  { message: "苦楽相生", source: "菜根譚", meaning: "苦しみと楽しみは互いに生み出す" },
  { message: "宇宙内事は己分内事", source: "菜根譚", meaning: "宇宙のことは自分のこと" },
  { message: "己分内事は宇宙内事", source: "菜根譚", meaning: "自分のことは宇宙のこと" },
  { message: "人情は冷暖を経て始めて親疎を識る", source: "菜根譚", meaning: "人情は冷たさと暖かさを経験して初めて親疎がわかる" },
  { message: "世態は炎涼を践んで方に履泥を知る", source: "菜根譚", meaning: "世態は盛衰を経験して初めて泥中の歩みを知る" },
  { message: "耳中に常に逆耳の言を聞く", source: "菜根譚", meaning: "耳に常に耳障りな言葉を聞く" },
  { message: "心中に常に払心の事あり", source: "菜根譚", meaning: "心に常に心を払う事がある" },
  { message: "醲肥辛甘は真味に非ず", source: "菜根譚", meaning: "濃厚で甘辛いものは真の味ではない" },
  { message: "真味は只淡に在り", source: "菜根譚", meaning: "真の味はただ淡白なところにある" },
  { message: "神奇卓異は至人に非ず", source: "菜根譚", meaning: "神秘的で特異なものは至人ではない" },
  { message: "至人は只平凡なるのみ", source: "菜根譚", meaning: "至人はただ平凡なだけである" },
  { message: "天地は寂然として動かず", source: "菜根譚", meaning: "天地は静かに動かない" },
  { message: "而も気機は息まず", source: "菜根譚", meaning: "しかし気は休まず動く" },
  { message: "日月は昼夜奔る", source: "菜根譚", meaning: "太陽と月は昼夜走る" },
  { message: "而も貞明を易えず", source: "菜根譚", meaning: "しかし正しい明るさは変わらない" },
  { message: "風狂の意気は宇宙を呑吐し得", source: "菜根譚", meaning: "自由奔放な気概は宇宙を飲み込める" },
  { message: "謹厚の規模は乾坤を振作し得", source: "菜根譚", meaning: "慎み深い規範は天地を奮い立たせる" },
  { message: "花は半開を看るに宜しく", source: "菜根譚", meaning: "花は半開きを見るのが良い" },
  { message: "酒は微酔に飲むに宜し", source: "菜根譚", meaning: "酒はほろ酔い程度に飲むのが良い" },
  // 高島易断・淵海子平 (30)
  { message: "運を待つは愚者、運を掴むは賢者", source: "高島易断", meaning: "運を待つだけでなく、自ら掴みに行く" },
  { message: "吉方に動けば天の助けあり", source: "高島易断", meaning: "吉方位に動けば天の助けがある" },
  { message: "時を得て動くは天意に叶う", source: "高島易断", meaning: "適切な時機に動くことは天の意志に適う" },
  { message: "本命星の輝く時、万事開運す", source: "高島易断", meaning: "自分の本命星が輝く時、すべてが開運する" },
  { message: "五行の相生を知り、自然の理に従う", source: "高島易断", meaning: "五行の相生関係を知り、自然の理に従う" },
  { message: "九星めぐりて一回りす、人生も又然り", source: "高島易断", meaning: "九星は巡って一周する、人生もまた同じ" },
  { message: "暗剣殺を避けて吉方を取る、これ開運の基", source: "高島易断", meaning: "凶方位を避けて吉方位を選ぶのが開運の基本" },
  { message: "天の時、地の利、人の和、三つ揃いて事成る", source: "高島易断", meaning: "天の時機、地の利、人の和が揃って事が成る" },
  { message: "日々の積善が未来の福を招く", source: "高島易断", meaning: "日々の善行が未来の幸福を招く" },
  { message: "心を正しくすれば、運も自ずと正しくなる", source: "高島易断", meaning: "心を正せば運も正される" },
  { message: "陰極まれば陽生ず、苦境も必ず転ずる", source: "高島易断", meaning: "陰が極まれば陽が生じる、苦境も必ず好転する" },
  { message: "方位の選びは人生の岐路を決す", source: "高島易断", meaning: "方位の選択は人生の分岐点を決める" },
  { message: "月盤日盤を観て、今日の行動を定む", source: "高島易断", meaning: "月盤と日盤を見て今日の行動を決める" },
  { message: "同会傾斜を知り、己の深層を悟る", source: "高島易断", meaning: "同会と傾斜を知り自分の深層を理解する" },
  { message: "十干十二支の巡りに天地の理あり", source: "淵海子平", meaning: "十干十二支の巡りに天地の理がある" },
  { message: "日干は己の本質、これを知りて人生を歩む", source: "淵海子平", meaning: "日干は自分の本質、これを知って人生を歩む" },
  { message: "用神を得れば万事叶う", source: "淵海子平", meaning: "必要な五行を得ればすべてが叶う" },
  { message: "格局高ければ志も高し", source: "淵海子平", meaning: "命式の格局が高ければ志も高い" },
  { message: "財官印食、バランスを要す", source: "淵海子平", meaning: "財・官・印・食のバランスが重要" },
  { message: "大運の巡りに人生の波あり", source: "淵海子平", meaning: "大運の巡りに人生の波がある" },
  { message: "流年を観て一年の計を立つ", source: "淵海子平", meaning: "流年を見て一年の計画を立てる" },
  { message: "合と刑は縁の深さを示す", source: "淵海子平", meaning: "合と刑は縁の深さを示す" },
  { message: "比肩劫財多ければ独立の志あり", source: "淵海子平", meaning: "比肩劫財が多ければ独立の意志がある" },
  { message: "正官偏官を得れば社会的地位を得る", source: "淵海子平", meaning: "正官偏官があれば社会的地位を得る" },
  { message: "食神傷官は才能の星", source: "淵海子平", meaning: "食神傷官は才能を示す星" },
  { message: "印綬偏印は学問の星", source: "淵海子平", meaning: "印綬偏印は学問を示す星" },
  { message: "正財偏財は富の星", source: "淵海子平", meaning: "正財偏財は富を示す星" },
  { message: "身旺身弱を弁えて進退を決す", source: "淵海子平", meaning: "身の強弱を見極めて進退を決める" },
  { message: "調候用神は季節の要", source: "淵海子平", meaning: "季節に応じた五行が重要" },
  { message: "四柱の配置に天機を読む", source: "淵海子平", meaning: "四柱の配置に天の機密を読む" },
  // 数秘術 (40)
  { message: "数は宇宙の言語なり", source: "ピタゴラス", meaning: "数は宇宙を表現する言語である" },
  { message: "万物は数なり", source: "ピタゴラス", meaning: "すべてのものは数で表現できる" },
  { message: "1は始まりにして全ての源", source: "数秘術", meaning: "1はすべての始まりであり源である" },
  { message: "2は調和と協調の数", source: "数秘術", meaning: "2は調和と協調を表す" },
  { message: "3は創造と表現の数", source: "数秘術", meaning: "3は創造性と表現を表す" },
  { message: "4は安定と基礎の数", source: "数秘術", meaning: "4は安定と基礎を表す" },
  { message: "5は変化と自由の数", source: "数秘術", meaning: "5は変化と自由を表す" },
  { message: "6は愛と責任の数", source: "数秘術", meaning: "6は愛と責任を表す" },
  { message: "7は真理と探求の数", source: "数秘術", meaning: "7は真理の探求を表す" },
  { message: "8は力と達成の数", source: "数秘術", meaning: "8は力と達成を表す" },
  { message: "9は完成と普遍の数", source: "数秘術", meaning: "9は完成と普遍性を表す" },
  { message: "11は直感と啓示のマスターナンバー", source: "数秘術", meaning: "11は直感と啓示のマスターナンバー" },
  { message: "22は実現と構築のマスターナンバー", source: "数秘術", meaning: "22は大きな実現のマスターナンバー" },
  { message: "33は奉仕と教育のマスターナンバー", source: "数秘術", meaning: "33は奉仕と教育のマスターナンバー" },
  { message: "生年月日に天命宿る", source: "数秘術", meaning: "生年月日には天命が宿っている" },
  { message: "ライフパスナンバーは魂の道標", source: "数秘術", meaning: "ライフパスナンバーは魂の道しるべ" },
  { message: "運命数と生まれ日が運命を織りなす", source: "数秘術", meaning: "運命数と生まれ日が運命を織りなす" },
  { message: "個人年のサイクルを知り時を掴む", source: "数秘術", meaning: "個人年のサイクルを知って時機を掴む" },
  { message: "数の波動は宇宙の波動", source: "数秘術", meaning: "数の波動は宇宙の波動と同じ" },
  { message: "名前の数字に性格宿る", source: "数秘術", meaning: "名前の数字に性格が宿る" },
  { message: "奇数は男性的、偶数は女性的エネルギー", source: "数秘術", meaning: "奇数は男性的、偶数は女性的エネルギー" },
  { message: "運命数は人生の目的を示す", source: "数秘術", meaning: "運命数は人生の目的を示す" },
  { message: "成熟数は晩年の姿を映す", source: "数秘術", meaning: "成熟数は晩年の姿を映す" },
  { message: "魂の数は内なる欲求を表す", source: "数秘術", meaning: "魂の数は内なる欲求を表す" },
  { message: "人格数は外面の印象を示す", source: "数秘術", meaning: "人格数は外面の印象を示す" },
  { message: "9年サイクルで人生は巡る", source: "数秘術", meaning: "9年サイクルで人生は巡る" },
  { message: "1年は種まき、9年は収穫", source: "数秘術", meaning: "1年は種をまき、9年は収穫する" },
  { message: "パーソナルイヤー1は新しい始まり", source: "数秘術", meaning: "パーソナルイヤー1は新しい始まり" },
  { message: "パーソナルイヤー5は変化の年", source: "数秘術", meaning: "パーソナルイヤー5は変化の年" },
  { message: "パーソナルイヤー9は完了の年", source: "数秘術", meaning: "パーソナルイヤー9は完了の年" },
  { message: "調和数は課題を示す", source: "数秘術", meaning: "調和数は人生の課題を示す" },
  { message: "欠落数は学ぶべきことを教える", source: "数秘術", meaning: "欠落数は学ぶべきことを教える" },
  { message: "数の組み合わせに深い意味あり", source: "数秘術", meaning: "数の組み合わせに深い意味がある" },
  { message: "マスターナンバーは高い使命を持つ", source: "数秘術", meaning: "マスターナンバーは高い使命を持つ" },
  { message: "カルマナンバーは前世の課題", source: "数秘術", meaning: "カルマナンバーは前世の課題" },
  { message: "数の波動と共鳴して生きる", source: "数秘術", meaning: "数の波動と共鳴して生きる" },
  { message: "運命の波に乗るには数を知る", source: "数秘術", meaning: "運命の波に乗るには数を知る" },
  { message: "誕生日は魂が選んだ数", source: "数秘術", meaning: "誕生日は魂が選んだ数字" },
  { message: "数秘のリズムは宇宙のリズム", source: "数秘術", meaning: "数秘のリズムは宇宙のリズム" },
  { message: "あなたの数字があなたの物語を語る", source: "数秘術", meaning: "あなたの数字があなたの物語を語る" },
  // 追加 (35)
  { message: "一日一善", source: "仏教", meaning: "一日に一つの善行を行う" },
  { message: "因果応報", source: "仏教", meaning: "善い行いには良い報い、悪い行いには悪い報い" },
  { message: "諸行無常", source: "仏教", meaning: "すべてのものは常に変化する" },
  { message: "一期一会", source: "茶道", meaning: "一生に一度の出会いを大切にする" },
  { message: "和敬清寂", source: "茶道", meaning: "調和、敬意、清らかさ、静けさ" },
  { message: "不立文字", source: "禅", meaning: "文字や言葉によらず心で悟る" },
  { message: "以心伝心", source: "禅", meaning: "心から心へ伝える" },
  { message: "明鏡止水", source: "荘子", meaning: "澄んだ鏡と静かな水のような心" },
  { message: "質実剛健", source: "武士道", meaning: "飾り気がなく真面目で強い" },
  { message: "忠孝仁義", source: "武士道", meaning: "忠義、孝行、仁愛、正義" },
  { message: "正々堂々", source: "武士道", meaning: "正しく堂々と行う" },
  { message: "一日の計は朝にあり", source: "民間伝承", meaning: "一日の計画は朝に立てる" },
  { message: "一年の計は元旦にあり", source: "民間伝承", meaning: "一年の計画は元旦に立てる" },
  { message: "継続は力なり", source: "民間伝承", meaning: "続けることが力になる" },
  { message: "雨降って地固まる", source: "民間伝承", meaning: "困難を経て関係が強くなる" },
  { message: "七転び八起き", source: "民間伝承", meaning: "何度失敗しても立ち上がる" },
  { message: "石の上にも三年", source: "民間伝承", meaning: "辛抱強く続ければ成果が出る" },
  { message: "塵も積もれば山となる", source: "民間伝承", meaning: "小さなことでも積み重ねれば大きくなる" },
  { message: "急がば回れ", source: "民間伝承", meaning: "急ぐ時こそ確実な方法を取る" },
  { message: "笑う門には福来る", source: "民間伝承", meaning: "笑顔の家には幸福が訪れる" },
  { message: "情けは人の為ならず", source: "民間伝承", meaning: "情けは巡り巡って自分に返ってくる" },
  { message: "出る杭は打たれる", source: "民間伝承", meaning: "目立つ者は批判される" },
  { message: "能ある鷹は爪を隠す", source: "民間伝承", meaning: "本当に能力のある者は見せびらかさない" },
  { message: "井の中の蛙大海を知らず", source: "民間伝承", meaning: "狭い世界しか知らない者は広い世界を知らない" },
  { message: "猿も木から落ちる", source: "民間伝承", meaning: "名人でも失敗することがある" },
  { message: "弘法も筆の誤り", source: "民間伝承", meaning: "達人でも間違いはある" },
  { message: "花より団子", source: "民間伝承", meaning: "風流より実利を取る" },
  { message: "光陰矢の如し", source: "古諺", meaning: "月日が経つのは矢のように速い" },
  { message: "歳月人を待たず", source: "古諺", meaning: "時は人を待ってくれない" },
  { message: "明日は明日の風が吹く", source: "民間伝承", meaning: "先のことは心配するな" },
  { message: "案ずるより産むが易し", source: "民間伝承", meaning: "心配するより実際にやってみた方が簡単" },
  { message: "習うより慣れよ", source: "民間伝承", meaning: "学ぶより実践で慣れる方が良い" },
  { message: "類は友を呼ぶ", source: "民間伝承", meaning: "似た者同士が集まる" },
  { message: "目は口ほどに物を言う", source: "民間伝承", meaning: "目は言葉と同じくらい多くを語る" },
  { message: "終わり良ければ全て良し", source: "西洋諺", meaning: "最後が良ければすべてが良い" },
];

// ============================================================
// 九星気学の日運ロジック
// ============================================================

const NINE_STAR_NAMES = [
  "一白水星", "二黒土星", "三碧木星", "四緑木星", "五黄土星",
  "六白金星", "七赤金星", "八白土星", "九紫火星",
];

const NINE_STAR_COLORS = [
  "#4A90E2", "#8B7355", "#4CAF50", "#66BB6A", "#FFD700",
  "#E8E8E8", "#E53935", "#CDDC39", "#9C27B0",
];

const NINE_STAR_DIRECTIONS = [
  "北", "南西", "東", "南東", "中央", "北西", "西", "北東", "南",
];

function calculateTodaysPanCenter(): number {
  const today = new Date();
  let yearSum = Array.from(String(today.getFullYear()), Number).reduce((a, b) => a + b, 0);
  while (yearSum > 9) {
    yearSum = Array.from(String(yearSum), Number).reduce((a, b) => a + b, 0);
  }
  const totalSum = yearSum + (today.getMonth() + 1) + today.getDate();
  let centerStar = totalSum % 9;
  if (centerStar === 0) centerStar = 9;
  return centerStar;
}

function getFortuneLevel(star: number, centerStar: number): NineStarFortune['level'] {
  const elements: Record<number, string> = {
    1: 'water', 2: 'earth', 3: 'wood', 4: 'wood', 5: 'earth',
    6: 'metal', 7: 'metal', 8: 'earth', 9: 'fire',
  };

  const sheng: Record<string, string> = {
    'water': 'wood', 'wood': 'fire', 'fire': 'earth', 'earth': 'metal', 'metal': 'water',
  };
  const shengBy: Record<string, string> = {
    'wood': 'water', 'fire': 'wood', 'earth': 'fire', 'metal': 'earth', 'water': 'metal',
  };

  const starElement = elements[star];
  const centerElement = elements[centerStar];

  if (star === centerStar) return '中吉';
  if (sheng[centerElement] === starElement) return '大吉';
  if (shengBy[centerElement] === starElement) return '吉';
  if (starElement === centerElement) return '小吉';
  if (star === 5 || centerStar === 5) return '末吉';
  return '凶';
}

function getNineStarMessage(level: string): string {
  const messages: Record<string, string[]> = {
    '大吉': ["今日は運気が最高潮です。新しいことを始めるのに最適な日。", "天の助けを得られる日。大胆な行動が吉を呼びます。", "幸運の波に乗れる一日。チャンスを逃さないように。"],
    '吉': ["順調な一日となるでしょう。前向きな姿勢が幸運を呼びます。", "良い流れに乗れる日。積極的に行動しましょう。", "運気は上昇中。笑顔で過ごすことでさらに運気アップ。"],
    '中吉': ["安定した運気の一日。着実に物事を進めましょう。", "バランスの取れた日。焦らず確実に進めば吉。", "穏やかな運気。日々の努力が実を結ぶ時。"],
    '小吉': ["小さな幸せを見つけられる日。感謝の心を持って。", "静かな吉運。身近な人との交流が幸運を呼びます。", "地道な努力が報われる日。謙虚な姿勢で。"],
    '末吉': ["慎重に行動すれば吉。無理せず進めましょう。", "今日は準備の日。明日のための土台作りを。", "控えめに過ごすことが吉。休息も大切です。"],
    '凶': ["今日は守りの日。新しいことは避けて慎重に。", "無理せず現状維持を心がけて。嵐の前の静けさ。", "今日は内省の日。次への準備期間と捉えましょう。"],
  };
  const arr = messages[level] || messages['中吉'];
  const today = new Date();
  return arr[(today.getDate() + today.getMonth()) % arr.length];
}

export function getTodayNineStarFortune(): NineStarFortune {
  const centerStar = calculateTodaysPanCenter();
  const level = getFortuneLevel(centerStar, centerStar);
  return {
    star: centerStar,
    starName: NINE_STAR_NAMES[centerStar - 1],
    level,
    message: getNineStarMessage(level),
    luckyColor: NINE_STAR_COLORS[centerStar - 1],
    luckyDirection: NINE_STAR_DIRECTIONS[centerStar - 1],
  };
}

// ============================================================
// 数秘術の日運ロジック
// ============================================================

const NUMEROLOGY_KEYWORDS = ["始まり", "協調", "創造", "安定", "自由", "愛", "探求", "成功", "完成"];
const NUMEROLOGY_MESSAGES = [
  "新しいスタートに最適な日。リーダーシップを発揮しましょう。",
  "協力と調和を大切に。人との繋がりが幸運を呼びます。",
  "創造性が高まる日。自己表現を楽しみましょう。",
  "堅実な努力が実る日。計画的に物事を進めて。",
  "変化を恐れず挑戦を。新しい経験が成長を促します。",
  "愛と思いやりの日。大切な人との時間を大切に。",
  "直感が冴える日。内なる声に耳を傾けて。",
  "目標達成に向けて行動を。成功のチャンスが近い。",
  "完成と達成の日。これまでの努力が報われます。",
];
const NUMEROLOGY_COLORS = [
  "#FF5252", "#4FC3F7", "#FFD54F", "#66BB6A", "#FF7043",
  "#EC407A", "#9575CD", "#26A69A", "#AB47BC",
];

function calculateTodayNumerology(): number {
  const today = new Date();
  let sum = today.getFullYear() + (today.getMonth() + 1) + today.getDate();
  while (sum > 9) {
    sum = Array.from(String(sum), Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export function getTodayNumerologyFortune(): NumerologyFortune {
  const number = calculateTodayNumerology();
  const scores = [5, 4, 5, 4, 3, 5, 4, 5, 4];
  return {
    number,
    score: scores[number - 1],
    message: NUMEROLOGY_MESSAGES[number - 1],
    keyword: NUMEROLOGY_KEYWORDS[number - 1],
    color: NUMEROLOGY_COLORS[number - 1],
  };
}

// ============================================================
// 古典格言選択
// ============================================================

export function getTodayClassicalFortune(): ClassicalFortune {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return CLASSICAL_FORTUNES[seed % CLASSICAL_FORTUNES.length];
}

// ============================================================
// 統合関数
// ============================================================

export function getTodayAllFortunes() {
  return {
    nineStar: getTodayNineStarFortune(),
    numerology: getTodayNumerologyFortune(),
    classical: getTodayClassicalFortune(),
  };
}
