import { useEffect,useState } from 'react';
import { StyleSheet, TextInput,Text, View,Button} from 'react-native';
import { DataTable } from 'react-native-paper';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import XLSX from "xlsx";

export default function spreadsheet() {
  const [data,setData]=useState([]);
  const [inputState,setInputState]=useState({});
  useEffect(() => {
    loadData();
  }, []);

  const loadData=async ()=>{
  try {
    const savedData=await useAsyncStorage.getItem("spreadsheetData");
    if(savedData!==null){
      const parsedData=JSON.parse(savedData);
      setInputState(parsedData);
    }
  } catch (error) {
    console.log("Error loading data",error);
  }
  }
  
  const saveData=async ()=>{
  try {
    const jsonData=JSON.stringify(inputState);
    await useAsyncStorage.setItem("spreadSheetData",jsonData);
  } catch (error) {
    console.log("Error loading data",error);
  }
  }

  const handleInputChange=(row,col,value)=>{
   setInputState((prevState)=>({
    ...prevState,["${row}-${col}"]:value}))
  }

  const handleDownload = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const fileName = 'spreadsheet.xlsx';
    saveData();
    const fileURL = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = fileURL;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  const renderTable = () => {
    const rows = [];

    for (let row = 0; row < 10; row++) {
      const rowData = [];
      for (let col = 0; col < 5; col++) {
        const value = inputState[`${row}-${col}`] || '';
        rowData.push(
          <TextInput
            key={`${row}-${col}`}
            style={styles.input}
            value={value}
            onChangeText={(text) => handleInputChange(row, col, text)}
          />
        );
      }
      rows.push(
        <DataTable.Row key={row}>
          {rowData.map((cell, index) => (
            <DataTable.Cell key={index}>{cell}</DataTable.Cell>
          ))}
        </DataTable.Row>
      );
    }

    return (
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Column 1</DataTable.Title>
          <DataTable.Title>Column 2</DataTable.Title>
          <DataTable.Title>Column 3</DataTable.Title>
          <DataTable.Title>Column 4</DataTable.Title>
          <DataTable.Title>Column 5</DataTable.Title>
        </DataTable.Header>

        {rows}

        <DataTable.Pagination
          page={1}
          numberOfPages={1}
          onPageChange={() => {}}
          label="1-1 of 1"
        />
      </DataTable>
    );
  };

  return (
    <View style={styles.container}>
      {renderTable()}
      <Button title="Download" onPress={handleDownload} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:16,
    backgroundColor: '#fff'
  },
  input:{
    borderWidth:1,
    borderColor:"#000",
    paddingHorizontal:8,
    paddingVertical:4
  }
});
