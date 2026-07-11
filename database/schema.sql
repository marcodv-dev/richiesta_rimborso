CREATE DATABASE IF NOT EXISTS rimborsi_spese;
USE rimborsi_spese;

CREATE TABLE IF NOT EXISTS utenti (
  UtenteID INT AUTO_INCREMENT PRIMARY KEY,
  Nome VARCHAR(100) NOT NULL,
  Cognome VARCHAR(100) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Ruolo VARCHAR(50) NOT NULL DEFAULT 'dipendente'
);

CREATE TABLE IF NOT EXISTS categoriaspesa (
  CategoriaID INT AUTO_INCREMENT PRIMARY KEY,
  Descrizione VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS richiestarimborso (
  RichiestaID INT AUTO_INCREMENT PRIMARY KEY,
  DataInserimento DATETIME DEFAULT CURRENT_TIMESTAMP,
  DataSpesa DATE NOT NULL,
  CategoriaID INT NOT NULL,
  Importo DECIMAL(10,2) NOT NULL,
  Descrizione TEXT NOT NULL,
  RiferimentoGiustificativo VARCHAR(255),
  Stato VARCHAR(50) NOT NULL DEFAULT 'In attesa',
  DipendenteID INT NOT NULL,
  DataValutazione DATE,
  ResponsabileValutazioneID INT,
  MotivazioneRifiuto TEXT,
  DataLiquidazione DATE,
  FOREIGN KEY (CategoriaID) REFERENCES categoriaspesa(CategoriaID),
  FOREIGN KEY (DipendenteID) REFERENCES utenti(UtenteID),
  FOREIGN KEY (ResponsabileValutazioneID) REFERENCES utenti(UtenteID)
);
