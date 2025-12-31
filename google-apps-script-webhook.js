function doPost(e) {
  try {
    // リクエストボディをパース
    const data = JSON.parse(e.postData.contents);
    const users = data.users;
    const exportedAt = data.exported_at;
    
    // アクティブなスプレッドシートを取得
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 新しいヘッダー定義
    const headers = [
      'ユーザーID',
      'メールアドレス',
      '電話番号',
      '作成日時',
      '最終ログイン',
      '確認済み（メール確認日時）',
      '診断クイズ数',
      'プロフィールLP数',
      'ビジネスLP数',
      'パートナーステータス',
      'パートナー登録日',
      '購入回数',
      '購入総額',
      '総閲覧数',
      '総クリック数',
      'AI使用数（クイズ）',
      'AI使用数（プロフィール）',
      'AI使用数（ビジネス）',
      'エクスポート日時'
    ];
    
    // シートを完全にクリアしてヘッダーから再作成
    sheet.clear();
    
    // ヘッダー行を追加
    sheet.appendRow(headers);
    
    // ヘッダー行のスタイル設定
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    // 新しいデータを追加
    if (users && users.length > 0) {
      users.forEach((user, index) => {
        try {
          sheet.appendRow([
            user.user_id || '',
            user.email || '',
            user.phone || '',
            user.created_at || '',
            user.last_sign_in_at || '',
            user.confirmed_at || '',
            user.quiz_count || 0,
            user.profile_count || 0,
            user.business_count || 0,
            user.is_partner || 'いいえ',
            user.partner_since || '',
            user.purchase_count || 0,
            user.purchase_total || 0,
            user.total_views || 0,
            user.total_clicks || 0,
            user.ai_usage_quiz || 0,
            user.ai_usage_profile || 0,
            user.ai_usage_business || 0,
            exportedAt ? new Date(exportedAt).toLocaleString('ja-JP') : new Date().toLocaleString('ja-JP')
          ]);
        } catch (rowError) {
          // 個別の行エラーをログに記録
          console.error('Error processing user at index ' + index + ':', rowError);
          console.error('User data:', JSON.stringify(user));
        }
      });
    } else {
      console.log('No users data received');
    }
    
    // 列幅を自動調整
    sheet.autoResizeColumns(1, 19);
    
    // 成功レスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `${users.length}件のユーザー情報を追加しました`,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // エラーの詳細をログに記録
    console.error('Webhook error:', error);
    console.error('Error stack:', error.stack);
    
    // エラーレスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: error.message,
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

