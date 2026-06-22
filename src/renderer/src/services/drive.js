// Lokasi file: src/renderer/src/services/drive.js

export const createDriveFolder = async (folderName) => {
  const token = localStorage.getItem('googleDriveToken');
  
  if (!token) {
    throw new Error("Token akses Google Drive tidak ditemukan. Silakan Sign Out dan Login kembali.");
  }

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Detail Error Drive:", errorData);
      throw new Error("Gagal membuat folder di Google Drive.");
    }

    const file = await response.json();
    console.log(`Berhasil membuat folder Drive: ${file.name} dengan ID: ${file.id}`);
    
    return file.id; 
    
  } catch (error) {
    console.error("Drive API Error:", error);
    throw error;
  }
};

// Fungsi untuk menghapus folder secara permanen dari Google Drive
export const deleteDriveFolder = async (folderId) => {
  const token = localStorage.getItem('googleDriveToken');
  if (!token) throw new Error("Token Drive tidak ditemukan");

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal menghapus folder dari Drive. Status: ${response.status}`);
    }
    
    console.log("Berhasil menghapus folder Drive dengan ID:", folderId);
    return true;
  } catch (error) {
    console.error("Error Delete Drive:", error);
    throw error;
  }
};