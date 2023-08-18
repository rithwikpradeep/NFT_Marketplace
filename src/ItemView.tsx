import React from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import { Item } from './contracts/marketplaceApp';
import { bsv } from 'scrypt-ts';

interface ItemProps {
  item: Item;
  idx: number;
  onBuy: (idx: number) => void;
}

const ItemView: React.FC<ItemProps> = ({ item, idx, onBuy }) => (
  <Card 
    sx={{ 
      minWidth: 275, 
      m: 2, 
      transition: 'transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
      }
    }}
  >
    <CardContent>
      <Box
        component="img"
        src={`./NFT-${idx + 1}.png`}
        alt={Buffer.from(item.name, "hex").toString("utf8")}
        sx={{
          width: '100%',
          maxHeight: 250,
          objectFit: 'cover',
          borderRadius: 10,
          marginBottom: 15
        }}
      />
      <Typography variant="h5" component="div">
        {Buffer.from(item.name, "hex").toString("utf8")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Price: {Number(item.price) / (100 * 10**6)} BSV
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Seller: {bsv.Address.fromHex('6f' + item.sellerAddr).toString()}
      </Typography>
      <Button 
    variant="contained" 
    onClick={() => {
      console.log("Buy button clicked for item:", idx);
      onBuy(idx);
    }}
    sx={{
      backgroundColor: '#000',
      color: '#ffd700',
      borderColor: '#ffd700',
      '&:hover': {
        backgroundColor: '#ffd700',
        color: '#000'
      }
    }}
  >
    Buy
</Button>
    </CardContent>
  </Card>
);

export default ItemView;
