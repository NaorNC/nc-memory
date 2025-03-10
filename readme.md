# Memory Minigame for FiveM

A customizable memory challenge minigame for FiveM servers. Players are presented with a sequence of numbers, some of which are then hidden. They must recall and input the hidden numbers correctly to win.

![image](https://github.com/user-attachments/assets/4da85e5a-83a5-432d-8449-1fa4c780a47d)

## Support

If you encounter any issues or have questions, feel free to join our Discord community - [Discord.gg/NCHub](https://discord.gg/NCHub)

## Features

- Customizable difficulty: adjust number length, memorization time, and total time
- Responsive UI that works on all screen sizes
- Keyboard and mouse support
- Clean, modern interface with animations
- Easy integration with other resources

## Installation

1. Download or clone this repository
2. Place the folder in your server's `resources` directory
3. Add `ensure nc-memory` to your server.cfg file
4. Restart your server

## Usage

### Basic Test Command

The resource includes a test command to try the minigame directly:

```
/testmemory [duration] [memorizeTime] [numberLength]
```

Parameters:
- `duration`: Total game duration in seconds (default: 30)
- `memorizeTime`: Time to memorize the numbers in seconds (default: 5)
- `numberLength`: Number of digits to memorize (default: 6)

Example: `/testmemory 45 8 10` will start a game with 10 numbers, 8 seconds to memorize, and 45 seconds total time.

### Integration with Other Scripts

#### Export Function

The main functionality is exposed through an export function:

```lua
exports['nc-memory']:StartMemoryGame(duration, memorizeTime, numberLength)
```

Parameters:
- `duration`: Total game duration in seconds
- `memorizeTime`: Time to memorize the numbers in seconds
- `numberLength`: Number of digits to memorize

Return Value:
- `true` if the player successfully completes the challenge
- `false` if the player fails or cancels the challenge

#### Example Integration

```lua
-- Example: Lockpicking a door with the memory minigame
RegisterCommand('lockpick', function()
    -- Start memory minigame with 25 seconds total time, 4 seconds to memorize, and 5 numbers
    local success = exports['nc-memory']:StartMemoryGame(25, 4, 5)
    
    if success then
        -- Player succeeded
        TriggerEvent('chatMessage', 'SYSTEM', {0, 255, 0}, 'Door unlocked successfully!')
        -- Additional code to unlock door...
    else
        -- Player failed
        TriggerEvent('chatMessage', 'SYSTEM', {255, 0, 0}, 'Failed to pick the lock!')
        -- Additional code for failure consequences...
    end
end)
```

### Advanced Integration Examples

#### Adjusting Difficulty Based on Skills or Items

```lua
-- Example: Adjust difficulty based on character skills
RegisterCommand('hack', function()
    local playerHackingLevel = 75 -- 0-100 skill level (example)
    
    -- Calculate difficulty based on player skill
    local numberLength = math.floor(10 - (playerHackingLevel / 20)) -- 5-10 numbers
    local memorizeTime = math.floor(3 + (playerHackingLevel / 25)) -- 3-7 seconds
    local duration = 30
    
    local success = exports['nc-memory']:StartMemoryGame(duration, memorizeTime, numberLength)
    
    if success then
        -- Success code...
    else
        -- Failure code...
    end
end)
```

#### Using with ESX or QBCore Framework

```lua
-- ESX example for hacking an ATM
ESX.RegisterUsableItem('hackingtool', function(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    -- Remove one-time use hacking tool
    xPlayer.removeInventoryItem('hackingtool', 1)
    
    -- Start the minigame
    TriggerClientEvent('nc-memory:hackAtm', source)
end)

-- Client-side
RegisterNetEvent('nc-memory:hackAtm')
AddEventHandler('nc-memory:hackAtm', function()
    -- First check if player is near an ATM...
    
    -- Start the memory game with challenging settings
    local success = exports['nc-memory']:StartMemoryGame(30, 3, 8)
    
    if success then
        ESX.ShowNotification('ATM hack successful!')
        TriggerServerEvent('esx_banking:hack', GetClosestAtm())
    else
        ESX.ShowNotification('ATM hack failed!')
        -- Maybe alert police...
    end
end)
```
