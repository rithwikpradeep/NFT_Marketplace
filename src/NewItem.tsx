  import React, { useState } from 'react';
  import { TextField, Button, Box } from '@mui/material';
  import './NewItem.css';


  interface NewItemProps {
    onAdd: (item: { name: string; price: number }) => void;
  }

  const NewItem: React.FC<NewItemProps> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onAdd({ name, price: Number(price) });
    };
  
    return (
      
      <Box component="form" onSubmit={handleSubmit} sx={{ m: 2 }}>
        <TextField
          id="name"
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          id="price"
          label="Price (BSV)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          fullWidth
          margin="normal"
          type="number"
          required
        />
  
        {/* Remove the redundant Box with component="form" */}
        <Box sx={{ m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#000",
              color: "white",
              borderColor: "#ffd700",
              borderWidth: 2,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#ffd700",
                color: "#000",
                boxShadow: "none"
              }
            }}
          >
            Add New Item
          </Button>
        </Box>
      </Box>
    );
  };
  
  export default NewItem;
  