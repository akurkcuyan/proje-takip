<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Klasörümüz yükleme dosyasıyla aynı dizindeki "uploads" klasörü olacak.
$uploadDir = 'uploads/';

// Klasör yoksa oluştur
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file'];
    
    // Rastgele isim üret (Aynı isimli yüklemeler çakışmasın)
    $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.-]/", "_", basename($file['name']));
    $targetPath = $uploadDir . $fileName;

    // Hata kontrolü
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessage = 'Unknown upload error';
        switch ($file['error']) {
            case UPLOAD_ERR_INI_SIZE:
                $errorMessage = 'Yüklenen dosya php.ini upload_max_filesize yönergesini aşıyor.';
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'Yüklenen dosya formda belirtilen MAX_FILE_SIZE değerini aşıyor.';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'Yüklenen dosya yalnızca kısmen yüklendi.';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage = 'Hiçbir dosya yüklenmedi.';
                break;
        }
        echo json_encode(['success' => false, 'message' => $errorMessage]);
        exit;
    }

    // Dosyayı taşı
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // İndirme / Görüntüleme URL'ini oluştur
        $url = 'uploads/' . $fileName;
        echo json_encode(['success' => true, 'url' => $url, 'message' => 'Dosya başarıyla yüklendi.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Yüklenen dosya sunucuda hedef klasöre taşınamadı. Klasör yazma izinlerini (chmod 755/777) kontrol edin.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dosya alınamadı veya geçersiz istek.']);
}
?>
