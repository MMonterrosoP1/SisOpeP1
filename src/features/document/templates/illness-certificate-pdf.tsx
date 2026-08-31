import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { IllnessCertificateData } from '../types';
import * as path from 'path';
import fs from 'fs';

// Resolve image path and read as base64 for reliable server-side rendering in Vercel
let logoSrc = '';
try {
  const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'premed-dark.png'));
  logoSrc = 'data:image/png;base64,' + logoBuffer.toString('base64');
} catch (e) {
  console.warn('Could not load logo for PDF:', e);
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 35,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  center: { textAlign: 'center' },
  justify: { textAlign: 'justify' },
  title: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginVertical: 8 },
  textStandard: { fontSize: 10, textAlign: 'center', lineHeight: 1.3, marginBottom: 8 },
  textLeft: { fontSize: 10, textAlign: 'left', lineHeight: 1.3, marginBottom: 8 },

  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  lastRow: {
    flexDirection: 'row',
  },
  cellHeader: {
    backgroundColor: '#cccccc',
    padding: 3,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
  },
  cellData: {
    padding: 3,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
  },
  cellNoBorder: {
    padding: 3,
    justifyContent: 'center',
  },

  headerLogo: { width: '30%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 5 },
  headerTitle: { width: '45%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 5 },
  headerCode: { width: '25%', justifyContent: 'center' },
  headerCodeTop: { borderBottomWidth: 1, borderColor: '#000', padding: 5, alignItems: 'center' },
  headerCodeBot: { padding: 5, alignItems: 'center' },

  signatureBox: {
    marginTop: 35,
    alignItems: 'center',
  },

  logoImage: {
    height: 35,
    objectFit: 'contain',
  }
});

export const IllnessCertificatePDF = ({ data }: { data: IllnessCertificateData }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>

      {/* --- ENCABEZADO --- */}
      <View style={styles.table}>
        <View style={styles.lastRow}>
          <View style={styles.headerLogo}>
            {logoSrc ? <Image src={logoSrc} style={styles.logoImage} /> : <Text>PreMed</Text>}
          </View>
          <View style={styles.headerTitle}>
            <Text style={[styles.bold, { fontSize: 14, textAlign: 'center' }]}>CONSTANCIA MÉDICA DE{"\n"}ENFERMEDAD</Text>
          </View>
          <View style={styles.headerCode}>
            <View style={styles.headerCodeTop}>
              <Text style={styles.bold}>GP-S0-RE-07</Text>
            </View>
            <View style={styles.headerCodeBot}>
              <Text>Vers. 01 / 2023</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.title, { marginTop: 10 }]}>A QUIEN CORRESPONDA</Text>

      <Text style={styles.textStandard}>
        {data.practitionerPreamble || "El/La infrascrito/a Médico/a y Cirujano/a hace constar:"}
      </Text>

      <Text style={styles.title}>HACE CONSTAR</Text>

      <Text style={styles.textLeft}>
        Que en cumplimiento de los artículos 302 y 303 del Acuerdo Gubernativo 229-2014 y sus reformas 33-2016 y
      </Text>

      {/* --- TABLA DATOS DEL PACIENTE --- */}
      <View style={styles.table}>
        <View style={styles.row}>
          <View style={[styles.cellHeader, { width: '15%' }]}><Text style={styles.bold}>FECHA</Text></View>
          <View style={[styles.cellData, { width: '15%' }]}><Text>{data.date}</Text></View>
          <View style={[styles.cellHeader, { width: '25%' }]}><Text style={styles.bold}>LUGAR DE TRABAJO</Text></View>
          <View style={[styles.cellNoBorder, { width: '45%' }]}><Text>{data.workplaceName}</Text></View>
        </View>
        <View style={styles.row}>
          <View style={[styles.cellHeader, { width: '30%' }]}><Text style={styles.bold}>NOMBRES Y APELLIDOS</Text></View>
          <View style={[styles.cellData, { width: '50%' }]}><Text>{data.fullName}</Text></View>
          <View style={[styles.cellHeader, { width: '10%' }]}><Text style={styles.bold}>EDAD</Text></View>
          <View style={[styles.cellNoBorder, { width: '10%' }]}><Text>{data.age}</Text></View>
        </View>
        <View style={styles.row}>
          <View style={[styles.cellHeader, { width: '25%' }]}><Text style={styles.bold}>CÓDIGO DE EMPLEADO</Text></View>
          <View style={[styles.cellData, { width: '15%' }]}><Text>{data.employeeCode || '-'}</Text></View>
          <View style={[styles.cellHeader, { width: '15%' }]}><Text style={styles.bold}>DPI-CUI</Text></View>
          <View style={[styles.cellData, { width: '25%' }]}><Text>{data.identityDocument}</Text></View>
          <View style={[styles.cellHeader, { width: '10%' }]}><Text style={styles.bold}>SEXO</Text></View>
          <View style={[styles.cellNoBorder, { width: '10%' }]}><Text>{data.sex}</Text></View>
        </View>
        <View style={styles.lastRow}>
          <View style={[styles.cellHeader, { width: '15%' }]}><Text style={styles.bold}>PUESTO</Text></View>
          <View style={[styles.cellNoBorder, { width: '85%' }]}><Text>{data.jobPositionName}</Text></View>
        </View>
      </View>

      {/* --- SINTOMATOLOGÍA --- */}
      <Text style={styles.textLeft}>quien consultó por los siguientes síntomas:</Text>
      <View style={styles.table}>
        <View style={styles.lastRow}>
          <View style={[styles.cellNoBorder, { width: '100%' }]}>
            <Text>{data.symptomatology || "-"}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.textLeft}>
        El(La) paciente fue sometido a evaluación médica ocupacional determinando el(los) siguiente(s) diagnóstico(s):
      </Text>

      {/* --- DIAGNÓSTICOS --- */}
      <View style={styles.table}>
        {(() => {
          if (data.diagnoses.length === 0) {
            return (
              <View style={styles.lastRow}>
                <View style={[styles.cellData, { width: '50%' }]}><Text>-</Text></View>
                <View style={[styles.cellNoBorder, { width: '50%' }]}><Text>-</Text></View>
              </View>
            );
          }
          const primary = data.diagnoses.find(d => d.isPrimary) || data.diagnoses[0];
          const others = data.diagnoses.filter(d => d !== primary);
          return (
            <View style={styles.lastRow}>
              <View style={[styles.cellData, { width: '50%' }]}>
                <Text>{primary.name}</Text>
              </View>
              <View style={[styles.cellNoBorder, { width: '50%' }]}>
                <Text>{others.length > 0 ? others.map(d => d.name).join("\n") : "-"}</Text>
              </View>
            </View>
          );
        })()}
      </View>

      <Text style={[styles.textLeft, { textAlign: 'justify' }]}>
        por lo que se indica tratamiento inicial y se brinda amplio plan educacional enfatizando que, si los síntomas persisten o agravan, deberá acudir al servicio de emergencia del Instituto Guatemalteco de Seguridad Social -IGSS- o a cualquier hospital de la red del Ministerio de Salud Pública y Asistencia Social -MSPAS- para recibir atención médica hospitalaria. En consecuencia, se determina la siguiente <Text style={styles.bold}>CONDICIÓN MÉDICA OCUPACIONAL:</Text>
      </Text>

      {/* --- TABLA APTITUD Y REPOSO --- */}
      <View style={styles.table}>
        <View style={styles.row}>
          <View style={[styles.cellHeader, { width: '35%' }]}><Text style={styles.bold}>APTO CON RECOMENDACIÓN</Text></View>
          <View style={[styles.cellData, { width: '5%', alignItems: 'center' }]}><Text>{data.aptitude === 'APTO_REC' ? 'X' : ''}</Text></View>

          <View style={[styles.cellHeader, { width: '35%' }]}><Text style={styles.bold}>APTO CON RESTRICCIÓN</Text></View>
          <View style={[styles.cellData, { width: '5%', alignItems: 'center' }]}><Text>{data.aptitude === 'APTO_RES' ? 'X' : ''}</Text></View>

          <View style={{ width: '20%' }}></View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellHeader, { width: '35%' }]}><Text style={styles.bold}>NO APTO TEMPORAL</Text></View>
          <View style={[styles.cellData, { width: '5%', alignItems: 'center' }]}><Text>{data.aptitude === 'NO_APTO_TEMP' ? 'X' : ''}</Text></View>

          <View style={[styles.cellHeader, { width: '35%' }]}><Text style={styles.bold}>NO APTO</Text></View>
          <View style={[styles.cellData, { width: '5%', alignItems: 'center' }]}><Text>{data.aptitude === 'NO_APTO' ? 'X' : ''}</Text></View>

          <View style={{ width: '20%' }}></View>
        </View>

        <View style={styles.lastRow}>
          <View style={[styles.cellHeader, { width: '15%' }]}><Text style={styles.bold}>REPOSO:</Text></View>

          <View style={[styles.cellHeader, { width: '15%', backgroundColor: '#fff' }]}><Text style={styles.bold}>24 HORAS</Text></View>
          <View style={[styles.cellData, { width: '10%', alignItems: 'center' }]}><Text>{data.suspensionHour?.includes('24') ? 'X' : ''}</Text></View>

          <View style={[styles.cellHeader, { width: '15%', backgroundColor: '#fff' }]}><Text style={styles.bold}>48 HORAS</Text></View>
          <View style={[styles.cellData, { width: '10%', alignItems: 'center' }]}><Text>{data.suspensionHour?.includes('48') ? 'X' : ''}</Text></View>

          <View style={[styles.cellHeader, { width: '15%', backgroundColor: '#fff' }]}><Text style={styles.bold}>72 HORAS</Text></View>
          <View style={[styles.cellData, { width: '20%', alignItems: 'center' }]}><Text>{data.suspensionHour?.includes('72') ? 'X' : ''}</Text></View>
        </View>
      </View>

      {/* --- TABLA OBSERVACIONES --- */}
      <View style={styles.table}>
        <View style={styles.row}>
          <View style={[styles.cellHeader, { width: '30%' }]}>
            <Text style={styles.bold}>OBSERVACIONES</Text>
          </View>
          <View style={{ width: '70%' }}></View>
        </View>
        <View style={styles.lastRow}>
          <View style={[styles.cellNoBorder, { width: '100%' }]}>
            <Text>{data.employerObservation || "-"}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.textLeft, { marginTop: 15 }]}>
        Por lo tanto, se extiende, sella y firma la presente constancia médica para los usos que el interesado crea conveniente.
      </Text>

      {/* --- FIRMA --- */}
      <View style={{ marginTop: 20 }}>
        <Text>Atentamente,</Text>
        <View style={styles.signatureBox}>
          <Text style={styles.bold}>
            {data.practitionerSex === 'FEMALE' ? 'Dra.' : 'Dr.'} {data.practitionerName}
          </Text>
        </View>
      </View>

    </Page>
  </Document>
);
