local isGameActive = false
local success = false
local gameResourceName = GetCurrentResourceName()

function StartMemoryGame(duration, memorizeTime, numberLength)
    if isGameActive then 
        return false 
    end
    
    isGameActive = true
    success = false
    
    SendNUIMessage({
        action = "startGame",
        duration = duration,
        memorizeTime = memorizeTime,
        numberLength = numberLength
    })
    
    SetNuiFocus(true, true)
    
    while isGameActive do
        Citizen.Wait(500)
    end
    
    return success
end

exports('StartMemoryGame', StartMemoryGame)

RegisterCommand('testmemory', function(source, args)
    local duration = 30
    local memorizeTime = 5
    local numberLength = 6
    
    if args[1] then duration = tonumber(args[1]) end
    if args[2] then memorizeTime = tonumber(args[2]) end
    if args[3] then numberLength = tonumber(args[3]) end
    
    if isGameActive then
        TriggerEvent('chat:addMessage', {
            color = {255, 100, 100},
            multiline = true,
            args = {"MEMORY GAME", "A game is already in progress. Please wait."}
        })
        return
    end
    
    TriggerEvent('chat:addMessage', {
        color = {255, 100, 100},
        multiline = true,
        args = {"MEMORY GAME", "Starting memory game with " .. numberLength .. " numbers, " .. memorizeTime .. " seconds to memorize, and " .. duration .. " seconds total."}
    })
    
    local gameSuccess = StartMemoryGame(duration, memorizeTime, numberLength)
    
    Citizen.Wait(500)
    
    if gameSuccess then
        TriggerEvent('chat:addMessage', {
            color = {100, 255, 100},
            multiline = true,
            args = {"MEMORY GAME", "Success! You completed the memory challenge."}
        })
    else
        TriggerEvent('chat:addMessage', {
            color = {255, 100, 100},
            multiline = true,
            args = {"MEMORY GAME", "Failed! You did not complete the memory challenge."}
        })
    end
end, false)

RegisterNUICallback('gameComplete', function(data, cb)
    success = data.success
    
    isGameActive = false
    
    SetNuiFocus(false, false)
    
    cb('ok')
end)

RegisterNUICallback('closeGame', function(data, cb)
    isGameActive = false
    success = false
    
    SetNuiFocus(false, false)
    
    cb('ok')
end)

AddEventHandler('onResourceStop', function(resourceName)
    if (resourceName ~= gameResourceName) then return end
    
    isGameActive = false
    success = false
    
    SetNuiFocus(false, false)
end)