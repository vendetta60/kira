export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: number;
          rutbe: string;
          soyad_ad_ata: string;
          unvan_sahibi: string;
          harbi_rutbe: string;
          odelik: string;
          protokol_no: string;
          protokol_tarixi: string | null;
          il: string;
          ay: string;
          calismayan_senedler: string;
          report_senedlerin_ucot_no: string;
          report_senedlerin_ucot_tarixi: string | null;
          report_senedlerin_tarixi: string | null;
          report_senedlerin_ucot_no2: string;
          kiraya_muqavilesi_tarixi: string | null;
          kiraya_muqavilesi_bitme_tarixi: string | null;
          daginmaz_emlak_arayisi: string | null;
          daginmaz_emlak_arayisi_avadl: string | null;
          nigah_haqqinda_sehadename: string | null;
          menzil_attestati: string | null;
          qrafeden_18ci_cixarig: string | null;
          sexsiyyet_vezigesinin_surati: string | null;
          sexsiyyet_vezigesinin_surati_avadl: string | null;
          menzil_atestati: string | null;
          belediyye_arayisi: string | null;
          ipoteka_kredit_zemaneti: string | null;
          protokol_nomresi: string;
          protokol_tarixi_2: string | null;
          kiraya_anirlarin_nomresi: string;
          kiraya_anirlarin_tarixi: string | null;
          senedler_qebul_eden_tarixi: string | null;
          huquqi_raportlar: boolean;
          husayyet_mektublar: boolean;
          kiraya_muqavilesi: boolean;
          menzil_attestat: boolean;
          belediyye_arayislari: boolean;
          ipoteka_kredit: boolean;
          protokol: boolean;
          kiraya_aniri: boolean;
          senedleri_qebul_eden: string;
          senedleri_qebul_tarixi: string | null;
          eli_vaziyyet: string;
          qeyd: string;
          daginmaz_emlak_arayisi_check: boolean;
          daginmaz_emlak_arayisi_avadl_check: boolean;
          nigah_haqqinda_sehadename_check: boolean;
          qrafeden_18ci_cixarig_check: boolean;
          sexsiyyet_vezigesinin_surati_check: boolean;
          sexsiyyet_vezigesinin_surati_avadl_check: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
    };
  };
};

export type Document = Database['public']['Tables']['documents']['Row'];
