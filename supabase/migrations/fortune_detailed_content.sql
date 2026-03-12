-- 全ての鑑定パターンの詳細コンテンツ作成
-- このSQLは initial_premium_data.sql を実行した後に実行してください
-- 九星気学、数秘術、四柱推命の全パターンの詳細情報を追加

-- ============================================
-- 九星気学の詳細コンテンツ（残り7パターン）
-- ============================================

-- 二黒土星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["献身的", "勤勉", "包容力", "協調性", "忍耐力"],
    "weaknesses": ["優柔不断", "八方美人", "自己主張不足", "心配性"],
    "career": ["サービス業", "農業", "不動産", "介護・福祉", "秘書", "サポート業務"],
    "love": "献身的で相手を支えるタイプ。尽くしすぎて自分を見失わないよう注意。",
    "money": "堅実で無駄遣いは少ない。コツコツ貯める能力に優れています。"
  },
  "compatibility": {
    "best": ["九紫火星", "三碧木星"],
    "best_reason": "火生土。火星から力を得て成長できます。",
    "good": ["二黒土星", "五黄土星", "八白土星"],
    "good_reason": "同じ土星同士は共感しやすく、安定した関係です。",
    "avoid": ["一白水星", "六白金星"],
    "avoid_reason": "土剋水で水星を抑制してしまい、金星には力を奪われます。"
  },
  "lucky_items": {
    "colors": ["黄", "茶", "オレンジ"],
    "directions": ["南西", "北東"],
    "numbers": [2, 5, 8],
    "items": ["陶器", "土製品", "四角いもの"],
    "stones": ["イエロージャスパー", "タイガーアイ", "シトリン"]
  },
  "life_advice": {
    "work": "サポート役として力を発揮。チームを支える存在として信頼されます。",
    "health": "胃腸・消化器系に注意。規則正しい食生活を心がけて。",
    "wealth": "堅実な貯蓄と不動産投資が向いています。",
    "relationships": "献身的な性格を活かし、人から頼られる存在に。"
  }
}'::jsonb
WHERE result_key = '2_earth';

-- 三碧木星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["行動力", "積極性", "若々しさ", "発想力", "コミュニケーション力"],
    "weaknesses": ["短気", "飽きっぽい", "落ち着きがない", "計画性不足"],
    "career": ["営業職", "アナウンサー", "ジャーナリスト", "イベント企画", "スポーツ関連"],
    "love": "情熱的でストレート。一目惚れしやすく、アクティブな恋愛を好みます。",
    "money": "収入は良いが、衝動買いに注意。計画的な貯蓄を心がけましょう。"
  },
  "compatibility": {
    "best": ["一白水星"],
    "best_reason": "水生木。水星があなたを育て、成長を助けます。",
    "good": ["三碧木星", "四緑木星", "九紫火星"],
    "good_reason": "木同士は共鳴し、火星とは木生火で良い関係です。",
    "avoid": ["六白金星", "七赤金星"],
    "avoid_reason": "金剋木。金星に削られ、力を発揮しにくい関係です。"
  },
  "lucky_items": {
    "colors": ["青", "緑", "ターコイズ"],
    "directions": ["東"],
    "numbers": [3, 8],
    "items": ["音楽機器", "スピーカー", "楽器"],
    "stones": ["ターコイズ", "エメラルド", "グリーンアベンチュリン"]
  },
  "life_advice": {
    "work": "新しいことに挑戦する勇気を。行動力を活かして道を切り開きましょう。",
    "health": "神経系とのどに注意。声を大切に、休息も必要です。",
    "wealth": "収入は良好。ただし衝動買いに注意し、計画的に。",
    "relationships": "明るく社交的。多くの人との交流を楽しめます。"
  }
}'::jsonb
WHERE result_key = '3_wood';

-- 四緑木星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["社交性", "調和力", "柔軟性", "優しさ", "交渉力"],
    "weaknesses": ["優柔不断", "八方美人", "流されやすい", "決断力不足"],
    "career": ["コーディネーター", "通訳・翻訳", "旅行業", "貿易", "人材紹介"],
    "love": "優しく穏やか。相手に合わせすぎて疲れないよう注意しましょう。",
    "money": "堅実な金銭感覚。人との縁を通じて金運が向上します。"
  },
  "compatibility": {
    "best": ["一白水星"],
    "best_reason": "水生木。水星があなたを育て、豊かさをもたらします。",
    "good": ["三碧木星", "四緑木星", "九紫火星"],
    "good_reason": "木同士は調和し、火星とは木生火で良好な関係です。",
    "avoid": ["六白金星", "七赤金星"],
    "avoid_reason": "金剋木。金星に削られ、本来の力を発揮しにくい。"
  },
  "lucky_items": {
    "colors": ["緑", "白", "ライトブルー"],
    "directions": ["東南"],
    "numbers": [4, 9],
    "items": ["香り物", "風鈴", "扇子"],
    "stones": ["ジェダイト", "アベンチュリン", "ペリドット"]
  },
  "life_advice": {
    "work": "調整役として活躍。人と人をつなぐ仕事で力を発揮します。",
    "health": "呼吸器系に注意。良い香りでリラックスを。",
    "wealth": "人脈を活かした収入増。信頼関係が金運につながります。",
    "relationships": "社交的で人気者。多くの人に好かれる存在です。"
  }
}'::jsonb
WHERE result_key = '4_wood';

-- 五黄土星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["リーダーシップ", "統率力", "責任感", "決断力", "包容力"],
    "weaknesses": ["我が強い", "頑固", "支配的", "プレッシャーに弱い"],
    "career": ["経営者", "政治家", "管理職", "独立業", "実業家"],
    "love": "包容力があり頼られる存在。ただし支配的にならないよう注意。",
    "money": "金運は強い。ただし大きな責任を伴うことが多いです。"
  },
  "compatibility": {
    "best": ["九紫火星"],
    "best_reason": "火生土。火星から力を得て、より強力になります。",
    "good": ["二黒土星", "五黄土星", "八白土星"],
    "good_reason": "同じ土星同士は理解し合い、安定した関係です。",
    "avoid": ["一白水星", "三碧木星"],
    "avoid_reason": "土剋水で水星を抑え、木星には土克木で対立しやすい。"
  },
  "lucky_items": {
    "colors": ["黄", "金", "茶"],
    "directions": ["中央"],
    "numbers": [5, 0],
    "items": ["高級品", "古いもの", "伝統工芸品"],
    "stones": ["タイガーアイ", "ゴールデンオブシディアン", "パイライト"]
  },
  "life_advice": {
    "work": "リーダーとして組織をまとめる力があります。責任を恐れず前進を。",
    "health": "ストレスに注意。適度な休息とリラックスが必要です。",
    "wealth": "金運は強いが、責任も大きい。計画的な資産管理を。",
    "relationships": "頼られる存在。ただし支配的にならず、信頼関係を大切に。"
  }
}'::jsonb
WHERE result_key = '5_earth';

-- 六白金星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["責任感", "誠実さ", "計画性", "完璧主義", "リーダーシップ"],
    "weaknesses": ["頑固", "プライドが高い", "融通が利かない", "孤立傾向"],
    "career": ["経営者", "官僚", "弁護士", "医師", "建築家", "技術者"],
    "love": "誠実で真面目。プライドが邪魔をしないよう、素直さも大切に。",
    "money": "堅実で計画的。長期的な資産形成が得意です。"
  },
  "compatibility": {
    "best": ["二黒土星", "八白土星"],
    "best_reason": "土生金。土星があなたを支え、力を与えてくれます。",
    "good": ["六白金星", "七赤金星", "一白水星"],
    "good_reason": "金同士は共感でき、水星とは金生水で良好な関係です。",
    "avoid": ["九紫火星"],
    "avoid_reason": "火剋金。火星に消耗され、力を失いやすい関係です。"
  },
  "lucky_items": {
    "colors": ["白", "金", "シルバー"],
    "directions": ["北西"],
    "numbers": [6, 1],
    "items": ["金属製品", "時計", "高級品"],
    "stones": ["プラチナ", "ホワイトゴールド", "真珠"]
  },
  "life_advice": {
    "work": "責任ある立場で力を発揮。完璧を目指しすぎず、柔軟性も大切に。",
    "health": "頭部・肺に注意。完璧主義からくるストレスに気をつけて。",
    "wealth": "堅実な投資と長期的な資産形成が向いています。",
    "relationships": "誠実で信頼される。ただしプライドを柔らかくすることも必要。"
  }
}'::jsonb
WHERE result_key = '6_metal';

-- 八白土星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["真面目", "誠実", "継続力", "堅実", "信頼性"],
    "weaknesses": ["頑固", "変化を嫌う", "融通が利かない", "内向的"],
    "career": ["不動産", "建設業", "銀行員", "公務員", "職人", "研究者"],
    "love": "真面目で誠実。時間をかけて信頼関係を築きます。",
    "money": "堅実で無駄遣いしない。不動産投資に向いています。"
  },
  "compatibility": {
    "best": ["九紫火星"],
    "best_reason": "火生土。火星から活力を得て、成長できます。",
    "good": ["二黒土星", "五黄土星", "八白土星"],
    "good_reason": "同じ土星同士は安定した関係を築けます。",
    "avoid": ["三碧木星", "一白水星"],
    "avoid_reason": "木剋土で木星に力を奪われ、土剋水で水星と対立しやすい。"
  },
  "lucky_items": {
    "colors": ["白", "黄", "茶"],
    "directions": ["北東", "南西"],
    "numbers": [8, 5, 10],
    "items": ["山の写真", "岩", "陶器"],
    "stones": ["オニキス", "ヘマタイト", "スモーキークォーツ"]
  },
  "life_advice": {
    "work": "継続は力なり。真面目にコツコツ積み重ねることで成功します。",
    "health": "関節・腰に注意。適度な運動とストレッチを。",
    "wealth": "不動産や土地への投資が吉。長期的な視点で。",
    "relationships": "信頼できる存在。ただし頑固さを和らげる柔軟性も必要。"
  }
}'::jsonb
WHERE result_key = '8_earth';

-- 九紫火星
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["知性", "華やかさ", "直感力", "芸術性", "カリスマ性"],
    "weaknesses": ["感情的", "移り気", "プライドが高い", "短気"],
    "career": ["芸術家", "デザイナー", "教育者", "広告", "出版", "美容関係"],
    "love": "情熱的で華やか。美しいものを好み、ロマンチックな恋愛を求めます。",
    "money": "金運はあるが、見栄や美に対する出費が多い傾向。"
  },
  "compatibility": {
    "best": ["三碧木星", "四緑木星"],
    "best_reason": "木生火。木星があなたに力を与え、輝きを増します。",
    "good": ["九紫火星", "二黒土星", "八白土星"],
    "good_reason": "火同士は共鳴し、土星とは火生土で良好な関係です。",
    "avoid": ["一白水星", "六白金星", "七赤金星"],
    "avoid_reason": "水剋火で水星に消され、火剋金で金星と対立しやすい。"
  },
  "lucky_items": {
    "colors": ["紫", "赤", "ピンク"],
    "directions": ["南"],
    "numbers": [9, 2, 7],
    "items": ["美術品", "宝石", "美しいもの"],
    "stones": ["アメジスト", "ルビー", "ガーネット"]
  },
  "life_advice": {
    "work": "センスと直感を活かした仕事で輝きます。美的感覚を大切に。",
    "health": "心臓・血圧に注意。興奮しすぎず、心の安定を保って。",
    "wealth": "金運はあるが、見栄の出費に注意。計画的な管理を。",
    "relationships": "華やかで人気者。ただし感情的にならず、冷静さも必要。"
  }
}'::jsonb
WHERE result_key = '9_fire';

-- ============================================
-- 数秘術ライフパスナンバーの詳細コンテンツ（残り12パターン）
-- ============================================

-- ライフパス2
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["協調性", "感受性", "外交力", "思いやり", "調和を重視"],
    "weaknesses": ["優柔不断", "依存的", "神経質", "自己主張が弱い"],
    "career": ["カウンセラー", "調停者", "秘書", "パートナーシップ業務", "サポート職"],
    "love": "パートナーシップを重視。調和的な関係を築くことができます。",
    "money": "一人より誰かと協力することで金運が向上します。"
  },
  "life_cycles": {
    "youth": "感受性が強く、他者の影響を受けやすい時期。",
    "middle": "協力関係を築くことで成功。調和を大切に。",
    "mature": "培った人間関係が財産となります。"
  },
  "challenges": {
    "main": "自己主張と調和のバランス。自分の意見を持ちながら協調することを学ぶ。",
    "relationships": "依存しすぎず、対等な関係を築くことが重要。",
    "work": "自分の価値を認識し、適切に主張する勇気を持つ。"
  },
  "spiritual_meaning": "協力、調和、パートナーシップ。他者との関係性を通じて成長する使命。"
}'::jsonb
WHERE result_key = 'lp_2';

-- ライフパス3
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["創造性", "表現力", "社交性", "楽観性", "コミュニケーション力"],
    "weaknesses": ["散漫", "表面的", "飽きっぽい", "計画性不足"],
    "career": ["芸術家", "エンターテイナー", "作家", "デザイナー", "広告", "教師"],
    "love": "楽しく明るい恋愛を好みます。表現力豊かに愛を伝えられます。",
    "money": "創造的な活動を通じて収入を得ます。ただし計画的な管理が必要。"
  },
  "life_cycles": {
    "youth": "才能の芽生え。自己表現の方法を模索する時期。",
    "middle": "創造性を発揮し、多くの人に影響を与える時期。",
    "mature": "培った表現力で人々を導く立場に。"
  },
  "challenges": {
    "main": "才能の集中。多くの興味を持つが、一つのことを深めることも学ぶ。",
    "relationships": "軽さと深さのバランス。表面的にならず、深い絆も大切に。",
    "work": "創造性と実務のバランス。楽しさと責任を両立させる。"
  },
  "spiritual_meaning": "自己表現、創造性、喜び。あなたの才能で世界を明るくする使命。"
}'::jsonb
WHERE result_key = 'lp_3';

-- ライフパス4
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["堅実性", "組織力", "信頼性", "忍耐力", "実務能力"],
    "weaknesses": ["融通が利かない", "頑固", "変化を嫌う", "完璧主義"],
    "career": ["建築家", "エンジニア", "会計士", "管理者", "職人", "公務員"],
    "love": "真面目で誠実。時間をかけて堅実な関係を築きます。",
    "money": "計画的で堅実。コツコツ貯蓄し、安定した資産を築きます。"
  },
  "life_cycles": {
    "youth": "基礎を固める時期。地道な努力が実を結びます。",
    "middle": "組織や構造を作り上げる時期。リーダーシップを発揮。",
    "mature": "築いた基盤が安定をもたらします。"
  },
  "challenges": {
    "main": "柔軟性と構造のバランス。変化を恐れず、適応することを学ぶ。",
    "relationships": "完璧主義を緩め、相手の不完全さも受け入れる。",
    "work": "効率と質のバランス。時には完璧でなくても進むことも必要。"
  },
  "spiritual_meaning": "基盤、秩序、実現化。しっかりした土台を築く使命。"
}'::jsonb
WHERE result_key = 'lp_4';

-- ライフパス5
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["自由奔放", "冒険心", "適応力", "好奇心", "多才"],
    "weaknesses": ["飽きっぽい", "無責任", "落ち着きがない", "衝動的"],
    "career": ["旅行業", "ジャーナリスト", "セールス", "起業家", "自由業"],
    "love": "自由を愛し、束縛を嫌います。刺激的な恋愛を求めます。",
    "money": "収入は不安定になりがち。自由業や複数の収入源が向いています。"
  },
  "life_cycles": {
    "youth": "多くの経験を通じて成長。変化を恐れない時期。",
    "middle": "自由と責任のバランスを学ぶ時期。",
    "mature": "豊富な経験が知恵となります。"
  },
  "challenges": {
    "main": "自由と責任のバランス。自由を享受しながらも、約束は守る。",
    "relationships": "コミットメントの学び。自由と関係性を両立させる。",
    "work": "継続性の習得。興味が移っても、完遂する力を養う。"
  },
  "spiritual_meaning": "自由、変化、経験。多様な体験を通じて成長する使命。"
}'::jsonb
WHERE result_key = 'lp_5';

-- ライフパス6
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["責任感", "世話好き", "調和重視", "芸術的センス", "愛情深い"],
    "weaknesses": ["お節介", "完璧主義", "心配性", "自己犠牲的"],
    "career": ["教育者", "看護師", "カウンセラー", "デザイナー", "家庭関連"],
    "love": "家族や愛する人を大切にします。献身的な愛を注ぎます。",
    "money": "家族のために働く傾向。安定した収入を得やすいです。"
  },
  "life_cycles": {
    "youth": "責任感の芽生え。人の世話を焼く傾向が現れます。",
    "middle": "家庭や地域社会で重要な役割を担う時期。",
    "mature": "愛と奉仕の精神が多くの人を助けます。"
  },
  "challenges": {
    "main": "自己と他者のバランス。他者を助けながらも、自分を大切に。",
    "relationships": "過干渉に注意。相手の成長を見守る寛容さも必要。",
    "work": "完璧を求めすぎず、適度なところで満足することを学ぶ。"
  },
  "spiritual_meaning": "愛、責任、調和。家族や地域社会に奉仕する使命。"
}'::jsonb
WHERE result_key = 'lp_6';

-- ライフパス7
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["分析力", "洞察力", "精神性", "知性", "独創性"],
    "weaknesses": ["孤立傾向", "批判的", "内向的", "現実逃避"],
    "career": ["研究者", "哲学者", "科学者", "スピリチュアル関連", "作家"],
    "love": "深い精神的つながりを求めます。表面的な関係は好みません。",
    "money": "物質的な豊かさよりも、精神的な充足を優先します。"
  },
  "life_cycles": {
    "youth": "内省的で一人の時間を好む。知識への渇望。",
    "middle": "真理の探求。専門分野での深い洞察を得る時期。",
    "mature": "培った知恵を他者と分かち合う段階。"
  },
  "challenges": {
    "main": "孤独と社会性のバランス。一人の時間も大切だが、人とのつながりも必要。",
    "relationships": "心を開くこと。信頼できる人には本音を見せることを学ぶ。",
    "work": "理想と現実のバランス。精神性と実務を両立させる。"
  },
  "spiritual_meaning": "探求、知恵、精神性。真理を探求し、他者を導く使命。"
}'::jsonb
WHERE result_key = 'lp_7';

-- ライフパス8
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["野心", "実行力", "統率力", "物質的成功", "決断力"],
    "weaknesses": ["物質主義", "支配的", "仕事中毒", "傲慢"],
    "career": ["経営者", "金融", "不動産", "弁護士", "マネージャー"],
    "love": "成功志向。パートナーにも野心的な面を求めがち。",
    "money": "金運は強いが、お金に執着しすぎないよう注意が必要。"
  },
  "life_cycles": {
    "youth": "物質的成功への強い欲求。努力を惜しまない時期。",
    "middle": "キャリアの頂点。大きな成功と責任を手にする時期。",
    "mature": "成功を次世代に還元する段階。"
  },
  "challenges": {
    "main": "力と奉仕のバランス。権力を得ても、他者への奉仕を忘れない。",
    "relationships": "支配欲を抑え、対等な関係を築くことを学ぶ。",
    "work": "お金と幸福のバランス。物質的成功だけが全てではない。"
  },
  "spiritual_meaning": "権力、達成、豊かさ。物質界で成功し、それを善いことに使う使命。"
}'::jsonb
WHERE result_key = 'lp_8';

-- ライフパス9
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["博愛", "理想主義", "芸術性", "人道主義", "寛容"],
    "weaknesses": ["理想が高すぎる", "現実逃避", "感情的", "自己犠牲"],
    "career": ["芸術家", "慈善事業", "教育者", "ヒーラー", "NGO活動"],
    "love": "理想的な愛を求めます。無条件の愛を与えられる存在。",
    "money": "お金よりも人類への貢献を優先。必要な分は自然と入ってきます。"
  },
  "life_cycles": {
    "youth": "高い理想と感受性。世界をより良くしたいという願望。",
    "middle": "人類への奉仕。多くの人に影響を与える時期。",
    "mature": "完成の段階。次のサイクルへの準備期間。"
  },
  "challenges": {
    "main": "理想と現実のバランス。完璧を求めすぎず、現実を受け入れる。",
    "relationships": "手放すこと学び。執着せず、必要な時には別れを受け入れる。",
    "work": "自己と他者のバランス。他者を助けながらも、自分を大切に。"
  },
  "spiritual_meaning": "完成、博愛、奉仕。人類全体への愛と奉仕の使命。"
}'::jsonb
WHERE result_key = 'lp_9';

-- マスターナンバー11
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["直感力", "霊性", "インスピレーション", "理想主義", "カリスマ性"],
    "weaknesses": ["神経質", "不安定", "現実逃避", "プレッシャーに弱い"],
    "career": ["スピリチュアル教師", "芸術家", "発明家", "カウンセラー", "啓蒙者"],
    "love": "精神的なつながりを重視。深いレベルでの理解を求めます。",
    "money": "物質的な豊かさは二の次。使命を果たすことが優先。"
  },
  "master_number_meaning": "2つの1が並ぶマスターナンバー。強力な直感と霊的な洞察力を持つ。高い精神性を持ち、他者を啓蒙する使命を持つ。",
  "challenges": {
    "main": "高い理想と現実世界の調和。地に足をつけながらも、高い目標を追求する。",
    "relationships": "普通の人との理解のギャップ。自分の感受性を大切にしながら、他者とも調和する。",
    "work": "使命とプレッシャーのバランス。高い期待に応えながらも、自分を追い詰めない。"
  },
  "spiritual_meaning": "啓蒙、直感、霊性。人類に光をもたらす高い使命を持つ。"
}'::jsonb
WHERE result_key = 'lp_11';

-- マスターナンバー22
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["実現力", "統率力", "野心", "ビジョン", "組織力"],
    "weaknesses": ["プレッシャー", "完璧主義", "ストレス", "挫折への恐れ"],
    "career": ["建築家", "大企業経営者", "国際的リーダー", "社会改革者"],
    "love": "理想的なパートナーシップを築きます。ただし仕事が優先になりがち。",
    "money": "大きな富を築く可能性。ただしそれは社会貢献のための手段。"
  },
  "master_number_meaning": "2つの2が並ぶマスターナンバー。マスタービルダーとも呼ばれ、壮大な夢を現実化する力を持つ。物質界と精神界の架け橋となる存在。",
  "challenges": {
    "main": "壮大なビジョンと現実的な一歩。大きな夢を持ちながらも、一つ一つ実現していく。",
    "relationships": "成功と人間関係のバランス。仕事に没頭しすぎず、大切な人との時間も確保する。",
    "work": "プレッシャーとの付き合い方。大きな使命を背負いながらも、自分を大切にする。"
  },
  "spiritual_meaning": "実現化、マスタービルダー、大成。世界規模で影響を与える使命を持つ。"
}'::jsonb
WHERE result_key = 'lp_22';

-- マスターナンバー33
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["無条件の愛", "癒しの力", "教師としての資質", "博愛", "奉仕"],
    "weaknesses": ["自己犠牲", "境界線の欠如", "感情的負担", "現実離れ"],
    "career": ["スピリチュアル教師", "ヒーラー", "慈善活動家", "芸術家", "教育者"],
    "love": "無条件の愛を与えられる存在。ただし自分を犠牲にしすぎないよう注意。",
    "money": "物質的な豊かさよりも、人々への奉仕を優先。必要なものは与えられます。"
  },
  "master_number_meaning": "3つの3が並ぶ最高のマスターナンバー。マスターティーチャーとも呼ばれ、無条件の愛と癒しの力を持つ。人類全体への奉仕が使命。",
  "challenges": {
    "main": "奉仕と自己保護のバランス。他者を助けながらも、自分のエネルギーを守る。",
    "relationships": "無条件の愛と境界線。愛を与えながらも、健全な境界線を保つ。",
    "work": "理想と現実のバランス。高い理想を持ちながらも、現実的な方法で実現する。"
  },
  "spiritual_meaning": "マスターティーチャー、癒し、無条件の愛。人類に最高の愛と叡智をもたらす使命。"
}'::jsonb
WHERE result_key = 'lp_33';

-- ============================================
-- 四柱推命 十干の詳細コンテンツ（残り9パターン）
-- ============================================

-- 乙（きのと）木
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["柔軟性", "適応力", "優しさ", "粘り強さ", "協調性"],
    "weaknesses": ["優柔不断", "依存的", "我慢しすぎる", "自己主張不足"],
    "career": ["園芸", "フラワーアレンジメント", "美容", "ファッション", "サービス業"],
    "love": "優しく柔軟。相手に合わせすぎないよう注意が必要です。",
    "money": "堅実な金銭感覚。人の助けを得て金運が向上します。"
  },
  "five_elements": {
    "element": "木（陰）",
    "nature": "草花、蔦など柔らかい植物",
    "season": "春",
    "direction": "東",
    "color": "緑、青",
    "body_part": "肝臓、胆嚢"
  },
  "compatibility": {
    "supports": {
      "element": "火",
      "stems": ["丙（ひのえ）", "丁（ひのと）"],
      "reason": "木生火。あなたの柔軟性が相手を輝かせます。"
    },
    "supported_by": {
      "element": "水",
      "stems": ["壬（みずのえ）", "癸（みずのと）"],
      "reason": "水生木。水の恵みを受けて美しく成長します。"
    },
    "conflicts": {
      "element": "金",
      "stems": ["庚（かのえ）", "辛（かのと）"],
      "reason": "金剋木。削られ傷つけられやすい関係です。"
    }
  },
  "life_advice": {
    "work": "柔軟性を活かし、環境に適応する力で成功します。",
    "health": "ストレスをため込まず、適度に発散を。",
    "wealth": "人との協力で金運向上。単独より協力が吉。",
    "relationships": "優しさが魅力。ただし自己主張も大切に。"
  }
}'::jsonb
WHERE result_key = 'stem_2';

-- 丙（ひのえ）火
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["明朗", "情熱的", "リーダーシップ", "社交性", "楽観性"],
    "weaknesses": ["短気", "自己中心的", "継続力不足", "浪費傾向"],
    "career": ["営業", "芸能", "広告", "スポーツ", "教育"],
    "love": "情熱的で明るい。ただし熱しやすく冷めやすい面も。",
    "money": "収入は良いが、使うのも早い。計画的な管理が必要。"
  },
  "five_elements": {
    "element": "火（陽）",
    "nature": "太陽、炎など強い火",
    "season": "夏",
    "direction": "南",
    "color": "赤、オレンジ",
    "body_part": "心臓、血管"
  },
  "compatibility": {
    "supports": {
      "element": "土",
      "stems": ["戊（つちのえ）", "己（つちのと）"],
      "reason": "火生土。あなたの情熱が相手を育てます。"
    },
    "supported_by": {
      "element": "木",
      "stems": ["甲（きのえ）", "乙（きのと）"],
      "reason": "木生火。木の力を得て、より輝きます。"
    },
    "conflicts": {
      "element": "水",
      "stems": ["壬（みずのえ）", "癸（みずのと）"],
      "reason": "水剋火。水に消されやすい関係です。"
    }
  },
  "life_advice": {
    "work": "明るさとリーダーシップで人を引っ張ります。",
    "health": "心臓・血圧に注意。興奮しすぎないように。",
    "wealth": "収入は良好。ただし計画的な貯蓄も忘れずに。",
    "relationships": "明朗快活で人気者。ただし短気に注意。"
  }
}'::jsonb
WHERE result_key = 'stem_3';

-- 丁（ひのと）火
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["繊細", "芸術的", "献身的", "温かさ", "気配り"],
    "weaknesses": ["神経質", "依存的", "不安定", "感情的"],
    "career": ["芸術", "美容", "料理", "医療", "カウンセリング"],
    "love": "温かく献身的。深い愛情を注ぐことができます。",
    "money": "安定志向。堅実に管理することが大切です。"
  },
  "five_elements": {
    "element": "火（陰）",
    "nature": "ろうそく、ランプなど柔らかい火",
    "season": "夏",
    "direction": "南",
    "color": "赤、ピンク",
    "body_part": "心臓、小腸"
  },
  "compatibility": {
    "supports": {
      "element": "土",
      "stems": ["戊（つちのえ）", "己（つちのと）"],
      "reason": "火生土。あなたの温かさが相手を育てます。"
    },
    "supported_by": {
      "element": "木",
      "stems": ["甲（きのえ）", "乙（きのと）"],
      "reason": "木生火。木の支えで安定して輝けます。"
    },
    "conflicts": {
      "element": "水",
      "stems": ["壬（みずのえ）", "癸（みずのと）"],
      "reason": "水剋火。簡単に消されやすい繊細な関係です。"
    }
  },
  "life_advice": {
    "work": "繊細さと芸術性を活かした仕事で力を発揮。",
    "health": "精神的ストレスに注意。リラックスが大切。",
    "wealth": "堅実な管理で安定。大きな冒険は避けて。",
    "relationships": "温かく思いやりがある。ただし依存しすぎに注意。"
  }
}'::jsonb
WHERE result_key = 'stem_4';

-- 戊（つちのえ）土
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["包容力", "安定感", "信頼性", "忍耐力", "責任感"],
    "weaknesses": ["頑固", "動きが鈍い", "変化を嫌う", "保守的"],
    "career": ["不動産", "農業", "建設", "銀行", "管理職"],
    "love": "安定した関係を築きます。包容力で相手を受け止めます。",
    "money": "堅実で安定。不動産投資に向いています。"
  },
  "five_elements": {
    "element": "土（陽）",
    "nature": "山、大地など堂々とした土",
    "season": "四季の変わり目",
    "direction": "中央",
    "color": "黄、茶",
    "body_part": "胃、脾臓"
  },
  "compatibility": {
    "supports": {
      "element": "金",
      "stems": ["庚（かのえ）", "辛（かのと）"],
      "reason": "土生金。あなたの安定感が相手を育てます。"
    },
    "supported_by": {
      "element": "火",
      "stems": ["丙（ひのえ）", "丁（ひのと）"],
      "reason": "火生土。火の力を得て、より強固になります。"
    },
    "conflicts": {
      "element": "木",
      "stems": ["甲（きのえ）", "乙（きのと）"],
      "reason": "木剋土。木に栄養を奪われやすい関係です。"
    }
  },
  "life_advice": {
    "work": "安定感と信頼性で組織を支えます。",
    "health": "胃腸に注意。規則正しい食生活を。",
    "wealth": "不動産など実物資産への投資が吉。",
    "relationships": "包容力があり頼られる。ただし柔軟性も必要。"
  }
}'::jsonb
WHERE result_key = 'stem_5';

-- 己（つちのと）土
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["細やかさ", "育成力", "献身的", "協調性", "実務能力"],
    "weaknesses": ["心配性", "優柔不断", "自己主張不足", "内向的"],
    "career": ["農業", "園芸", "教育", "福祉", "サービス業"],
    "love": "献身的で相手を育てます。優しく包み込む愛情。",
    "money": "堅実で無駄遣いしない。コツコツ貯める能力。"
  },
  "five_elements": {
    "element": "土（陰）",
    "nature": "畑、田んぼなど柔らかい土",
    "season": "四季の変わり目",
    "direction": "中央",
    "color": "黄、茶",
    "body_part": "胃、脾臓"
  },
  "compatibility": {
    "supports": {
      "element": "金",
      "stems": ["庚（かのえ）", "辛（かのと）"],
      "reason": "土生金。あなたの育成力が相手を輝かせます。"
    },
    "supported_by": {
      "element": "火",
      "stems": ["丙（ひのえ）", "丁（ひのと）"],
      "reason": "火生土。火の温かさで豊かになります。"
    },
    "conflicts": {
      "element": "木",
      "stems": ["甲（きのえ）", "乙（きのと）"],
      "reason": "木剋土。栄養を奪われやすい関係です。"
    }
  },
  "life_advice": {
    "work": "育成や世話役として力を発揮します。",
    "health": "胃腸の健康管理が大切。ストレス性の不調に注意。",
    "wealth": "堅実な貯蓄と実物資産への投資が向いています。",
    "relationships": "献身的で優しい。ただし自分も大切にして。"
  }
}'::jsonb
WHERE result_key = 'stem_6';

-- 庚（かのえ）金
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["正義感", "決断力", "実行力", "リーダーシップ", "潔さ"],
    "weaknesses": ["厳しすぎる", "頑固", "配慮不足", "攻撃的"],
    "career": ["軍人", "警察", "金融", "金属加工", "外科医"],
    "love": "真っすぐで潔い。ただし厳しさを和らげることも必要。",
    "money": "金運は強いが、投機には注意。堅実な投資が吉。"
  },
  "five_elements": {
    "element": "金（陽）",
    "nature": "鉄、刀など硬い金属",
    "season": "秋",
    "direction": "西",
    "color": "白、金",
    "body_part": "肺、大腸"
  },
  "compatibility": {
    "supports": {
      "element": "水",
      "stems": ["壬（みずのえ）", "癸（みずのと）"],
      "reason": "金生水。あなたの力が相手に恵みを与えます。"
    },
    "supported_by": {
      "element": "土",
      "stems": ["戊（つちのえ）", "己（つちのと）"],
      "reason": "土生金。土の安定感があなたを強化します。"
    },
    "conflicts": {
      "element": "火",
      "stems": ["丙（ひのえ）", "丁（ひのと）"],
      "reason": "火剋金。火に溶かされやすい関係です。"
    }
  },
  "life_advice": {
    "work": "正義感とリーダーシップで組織を導きます。",
    "health": "呼吸器系に注意。深呼吸とリラックスが大切。",
    "wealth": "堅実な投資が吉。投機的なものは避けて。",
    "relationships": "正義感が強い。ただし柔軟性も大切に。"
  }
}'::jsonb
WHERE result_key = 'stem_7';

-- 辛（かのと）金
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["繊細", "美的センス", "完璧主義", "品格", "鋭い洞察力"],
    "weaknesses": ["神経質", "プライドが高い", "批判的", "孤高"],
    "career": ["宝石商", "デザイナー", "美容", "会計士", "評論家"],
    "love": "美しいものを好みます。理想が高く、選り好みする傾向。",
    "money": "品質重視。良いものにはお金を惜しまない傾向。"
  },
  "five_elements": {
    "element": "金（陰）",
    "nature": "宝石、貴金属など美しい金属",
    "season": "秋",
    "direction": "西",
    "color": "白、銀",
    "body_part": "肺、大腸"
  },
  "compatibility": {
    "supports": {
      "element": "水",
      "stems": ["壬（みずのえ）", "癸（みずのと）"],
      "reason": "金生水。あなたの繊細さが相手に潤いを与えます。"
    },
    "supported_by": {
      "element": "土",
      "stems": ["戊（つちのえ）", "己（つちのと）"],
      "reason": "土生金。土の中で磨かれて輝きます。"
    },
    "conflicts": {
      "element": "火",
      "stems": ["丙（ひのえ）", "丁（ひのと）"],
      "reason": "火剋金。火に溶かされ、形を失いやすい。"
    }
  },
  "life_advice": {
    "work": "美的センスと繊細さを活かした仕事で輝きます。",
    "health": "呼吸器系とストレスに注意。美しい環境が大切。",
    "wealth": "質の良いものへの投資。安物買いは避けて。",
    "relationships": "品格があり魅力的。ただしプライドを柔らかく。"
  }
}'::jsonb
WHERE result_key = 'stem_8';

-- 壬（みずのえ）水
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["包容力", "柔軟性", "知恵", "行動力", "社交性"],
    "weaknesses": ["流されやすい", "優柔不断", "一貫性不足", "冷たさ"],
    "career": ["運輸", "流通", "水産業", "貿易", "旅行業"],
    "love": "おおらかで包容力がある。ただし一貫性が大切。",
    "money": "流動的。入るのも出るのも大きい傾向。"
  },
  "five_elements": {
    "element": "水（陽）",
    "nature": "海、大河など大きな水",
    "season": "冬",
    "direction": "北",
    "color": "黒、青",
    "body_part": "腎臓、膀胱"
  },
  "compatibility": {
    "supports": {
      "element": "木",
      "stems": ["甲（きのえ）", "乙（きのと）"],
      "reason": "水生木。あなたの力が相手を育てます。"
    },
    "supported_by": {
      "element": "金",
      "stems": ["庚（かのえ）", "辛（かのと）"],
      "reason": "金生水。金の力を得て、より豊かになります。"
    },
    "conflicts": {
      "element": "土",
      "stems": ["戊（つちのえ）", "己（つちのと）"],
      "reason": "土剋水。土に流れを止められやすい関係です。"
    }
  },
  "life_advice": {
    "work": "柔軟性と行動力を活かし、広く活躍します。",
    "health": "腎臓・泌尿器系に注意。冷えに気をつけて。",
    "wealth": "流動的。入る分だけでなく、貯蓄も大切に。",
    "relationships": "おおらかで社交的。ただし一貫性も必要。"
  }
}'::jsonb
WHERE result_key = 'stem_9';

-- 癸（みずのと）水
UPDATE fortune_contents 
SET detailed_content = '{
  "personality": {
    "strengths": ["繊細", "洞察力", "知性", "適応力", "直感力"],
    "weaknesses": ["神経質", "心配性", "依存的", "内向的"],
    "career": ["研究者", "作家", "カウンセラー", "医療", "水商売"],
    "love": "深い愛情を持ちますが、表現は控えめ。じっくり関係を育てます。",
    "money": "堅実で無駄遣いしない。ただし収入は安定重視。"
  },
  "five_elements": {
    "element": "水（陰）",
    "nature": "雨、露、地下水など静かな水",
    "season": "冬",
    "direction": "北",
    "color": "黒、濃紺",
    "body_part": "腎臓、生殖器"
  },
  "compatibility": {
    "supports": {
      "element": "木",
      "stems": ["甲（きのえ）", "乙（きのと）"],
      "reason": "水生木。あなたの優しさが相手を育てます。"
    },
    "supported_by": {
      "element": "金",
      "stems": ["庚（かのえ）", "辛（かのと）"],
      "reason": "金生水。金の恵みを受けて潤います。"
    },
    "conflicts": {
      "element": "土",
      "stems": ["戊（つちのえ）", "己（つちのと）"],
      "reason": "土剋水。土に吸収され、力を失いやすい。"
    }
  },
  "life_advice": {
    "work": "洞察力と知性を活かした仕事で力を発揮します。",
    "health": "腎臓・泌尿器系の健康管理が大切。冷えに注意。",
    "wealth": "堅実な貯蓄。無駄遣いは少ないタイプ。",
    "relationships": "繊細で思いやりがある。深い信頼関係を築けます。"
  }
}'::jsonb
WHERE result_key = 'stem_10';

-- ============================================
-- 完了メッセージ
-- ============================================

DO $$
DECLARE
  total_count INTEGER;
  detailed_count INTEGER;
  nine_star_count INTEGER;
  numerology_count INTEGER;
  four_pillars_count INTEGER;
BEGIN
  -- 全体のレコード数
  SELECT COUNT(*) INTO total_count FROM fortune_contents;
  
  -- detailed_contentが設定されているレコード数
  SELECT COUNT(*) INTO detailed_count 
  FROM fortune_contents 
  WHERE detailed_content IS NOT NULL;
  
  -- カテゴリ別の詳細コンテンツ数
  SELECT COUNT(*) INTO nine_star_count
  FROM fortune_contents
  WHERE type_slug = 'nine_star' AND detailed_content IS NOT NULL;
  
  SELECT COUNT(*) INTO numerology_count
  FROM fortune_contents
  WHERE type_slug = 'numerology' AND detailed_content IS NOT NULL;
  
  SELECT COUNT(*) INTO four_pillars_count
  FROM fortune_contents
  WHERE type_slug = 'four_pillars' AND detailed_content IS NOT NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '全詳細コンテンツ作成完了';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'fortune_contents 全レコード数: %', total_count;
  RAISE NOTICE 'detailed_content 設定済み: % レコード', detailed_count;
  RAISE NOTICE '';
  RAISE NOTICE 'カテゴリ別詳細コンテンツ:';
  RAISE NOTICE '  - 九星気学: % パターン', nine_star_count;
  RAISE NOTICE '  - 数秘術: % パターン', numerology_count;
  RAISE NOTICE '  - 四柱推命: % パターン', four_pillars_count;
  RAISE NOTICE '';
  RAISE NOTICE 'プレミアム機能の準備が完了しました！';
  RAISE NOTICE '========================================';
END $$;




























